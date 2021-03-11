import {Middleware} from './middleware'
import {Request} from 'node-fetch'
import {get, set} from './url'

export type PrefixOptions = {test?: (url: string) => boolean} | undefined

export function prefix(prefix: string, {test}: PrefixOptions = {}): Middleware {
  if (!test) test = url => url.startsWith('/')
  return (url, init, next) => {
    if (test(get(url))) url = set(prefix + get(url), url, init)

    return next(url, init)
  }
}
