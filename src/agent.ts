import {Middleware} from './middleware'

export function agent(agent: string): Middleware {
  return (url, init, next) => {
    init = {...init, headers: {...init?.headers, 'User-Agent': agent}}

    return next(url, init)
  }
}
