import {Middleware} from './middleware'
import fetch, {RequestInfo, RequestInit, Response} from 'node-fetch'

export function compose(middleware: Middleware[]): Middleware {
  return (url, init, next) => {
    async function chain(url: RequestInfo, init: RequestInit, middleware: Middleware[]): Promise<Response> {
      if (middleware.length === 0) return (next ?? fetch)(url, init)
      return middleware[0](url, init,(url, init) => chain(url, init, middleware.slice(1)))
    }

    return chain(url, init, middleware)
  }
}
