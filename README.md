[![Build Status](https://travis-ci.org/lev-kuznetsov/node-fetch-middleware.svg?branch=master)](https://travis-ci.org/lev-kuznetsov/node-fetch-middleware) [![npm version](https://badge.fury.io/js/node-fetch-middleware.svg)](https://badge.fury.io/js/node-fetch-middleware) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) 

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
