import {Middleware} from './middleware'
import {merge} from 'lodash'

export type BearerOptions = {provider: () => Promise<string>}

export function bearer({provider}: BearerOptions): Middleware {
  return async (url, init, next) => {
    if (!init) init = {}
    const token = await provider()
    merge(init, {headers: {'Authorization': `Bearer ${token}`}})
    return next(url, init)
  }
}
