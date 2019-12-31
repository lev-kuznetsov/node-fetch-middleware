# Async middleware for node-fetch

Elegant asynchronous middleware chaining around [node-fetch](https://www.npmjs.com/package/node-fetch)
calls. Yes, kind of yet another one. Motivation behind this started with deprecation
of `request` and looking at alternatives I just couldn't find a plugin system that
was reasonable.

A middleware is a function that accepts the first two arguments of `fetch` - url and
init and a wrapped function for the next middleware call which itself has identical
API as original `fetch`, and returns a promise of a `Response`, same as `fetch`.
Middleware has an opportunity to modify or replace request arguments and the
response. Here's a middleware:

```javascript
const mw = async (url, init, next) => {
  // ... do anything you want with url and init
  const response = await next(url, init)
  // ... do whatever you want with response
  return response
}
```

and you can use it like this:

```javascript
mw('https://www.google.com', null, fetch)
```

### compose

Main tool shipped in this library is `compose` which chains multiple middleware
together:

```javascript
const {compose} = require('node-fetch-middleware')

const fetch = compose([mw1, mw2])

fetch('https://www.google.com').then(console.log) // compose will tack on the last fetch for you
```

I'm also shipping several middleware I find useful with this library:

### json

Allows structured json request body and parses json output.

```javascript
const {compose, json} = require('node-fetch-middleware')

compose([json])('http://localhost:8080/myapi', {
  method: 'POST', json: {foo: 'bar'}
}).then(response => console.log(response.parsed))
```

### query

Structured query string dubiously missing from `fetch`.

```javascript
compose([query])('http://localhost:8080/myapi', {query: {foo: 'bar'}})
```

### reject

Throw exception on an unexpected response.

```javascript
compose([reject(/* Can provide own test, default will throw for status >= 400 */)])('https://nowhere')
```

### prefix

Prefix all request urls.

```javascript
compose([prefix('https://www.google.com', /* Other options */)])('/foo')
```

### bearer

Attach a bearer token to requests, allows for asynchronous provider

```javascript
compose([bearer({provider: async () => 'token'})])('https://localhost:8080/myapi')
```

### cache

Cache responses. Factory defaults will cache GET, HEAD, and OPTIONS responses with
status codes under 400 for 30 seconds. See options for possibilities.

```javascript
compose([cache()])('https://www.google.com')
```

---

Here's real example, this wraps `fetch` up to provide a cached bearer token from
auth0 auth provider using client/secret to refresh. Token is cached based on its
lifetime

```typescript
import {bearer, cache, compose, json, Middleware, reject} from 'node-fetch-middleware'
import * as Cache from 'node-cache'

const tokens = new Cache()

export type Auth0Options = {url: string, client: string, secret: string, grant: string, audience: string}

export function auth0({url, client, secret, grant, audience}: Auth0Options): Middleware {
  const fetch = compose([
    cache({
      cache: tokens,
      key: () => client,
      ttl: ({parsed: {expires_in}}) => expires_in - 60
    }),
    json,
    reject()
  ])
  return bearer({
    async provider() {
      const {parsed: {access_token: token}} = await fetch(url, {
        method: 'POST',
        json: {client_id: client, client_secret: secret, grant_type: grant, audience}
      })
      return token
    }
  })
}

const fetch = compose([cache(), auth0({
  url: 'https://mytenant.auth0.com', client: process.env.AUTH0_CLIENT, secret: process.env.AUTH0_SECRET, grant: 'client_credentials', audience: 'https://myapi.com/'
}), json, reject()])

fetch('https://myapi.com/private', {method: 'POST', json: {foo: 'bar'}}).then(({parsed}) => console.log(parsed))
```