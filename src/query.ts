import {Middleware} from './middleware'
import {RequestInit} from 'node-fetch'
import {get, set} from './url'
import * as params from 'jquery-param'

declare module 'node-fetch' {interface RequestInit {query?: {[key: string]: string | string[]}}}

export const query: Middleware = (url, init, next) => {
  if (init && init.query) {
    const qs = params(init.query)
    delete init.query
    url = set(get(url) + '?' + qs)
  }
  return next(url, init)
}
