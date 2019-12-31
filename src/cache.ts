import {Middleware} from './middleware'
import * as Cache from 'node-cache'
import {RequestInfo, RequestInit, Response} from 'node-fetch'
import {get} from './url'

const buffer = new Cache()

export type Key = (url: RequestInfo, init?: RequestInit) => string | null
export type Ttl = (response: Response, url: RequestInfo, init?: RequestInit) => number | null
export type CacheOptions = {key?: Key, ttl?: Ttl, cache?: Cache}

export function ttl(ttl: number): Ttl {
  return ({status}, url) => status >= 400 ? null : ttl
}

const byUrl: Key = (url, init) => {
  return ['GET', 'HEAD', 'OPTIONS'].indexOf((init && init.method.toUpperCase()) ?? 'GET') >= 0 && get(url)
}

export function cache(options: CacheOptions = {}): Middleware {
  if (!options.key) options.key = byUrl
  if (!options.ttl) options.ttl = ttl(30)
  if (!options.cache) options.cache = buffer
  return async (url, init, next) => {
    const key = (options.key || byUrl)(url, init)
    let response = typeof key === 'string' && ((options.cache || buffer).get(key) as Response)
    if (!response) {
      response = await next(url, init)
      if (key) {
        const ttl = options.ttl(response, url, init)
        if (ttl) options.cache.set(key, response)
      }
    }
    return response
  }
}
