import {Middleware} from './middleware'
import {RequestInit} from 'node-fetch'
import {get, set} from './url'
import params from 'jquery-param'

declare module 'node-fetch' {interface RequestInit {query?: string | {[key: string]: string | string[]}}}

export const query: Middleware = (url, init, next) => {
  if (init && init.query) {
    if (typeof init.query === 'string') url = set(get(url) + '?' + init.query)
    else {
      const qs = params(init.query)
      url = set(get(url) + '?' + qs)
    }
    delete init.query
  }
  return next(url, init)
}
