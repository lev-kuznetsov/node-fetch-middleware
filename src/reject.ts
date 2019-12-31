import {Middleware} from './middleware'
import {Response} from 'node-fetch'

export class UnexpectedResponseError extends Error {
  constructor(public readonly response: Response) {super(response.statusText)}
}

export type RejectOptions = {test?: (response: Response) => boolean}

export function reject({test}: RejectOptions = {}): Middleware {
  if (!test) test = ({status}) => status >= 400
  return async (url, init, next) => {
    const response = await next(url, init)
    if (test(response)) throw new UnexpectedResponseError(response)
    return response
  }
}
