import {Middleware} from './middleware'
import {Body, RequestInit} from 'node-fetch'

declare module 'node-fetch' {
  interface Body {parsed?: any}
  interface RequestInit {json?: any}
}

export const json: Middleware = async (url, init, next) => {
  init = {...init, headers: {...init?.headers, 'Accept': 'application/json', 'Content-Type': 'application/json'}}
  if (init.json) init.body = JSON.stringify(init.json)
  const response = await next(url, init)
  response.parsed = await response.json()
  return response
}
