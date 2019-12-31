import {RequestInfo, RequestInit, Request} from 'node-fetch'
import {merge, pick} from 'lodash'

export function get(url: RequestInfo): string {
  if (typeof url === 'string') return url
  else if ('href' in url) return url.href
  else return url.url
}

export function set(value: string, url?: RequestInfo, init?: RequestInit): RequestInfo {
  if (!url || typeof url === 'string') return value
  else if ('href' in url) {
    url.href = value
    return url
  } else return new Request(value, init)
}
