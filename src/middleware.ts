import {RequestInfo, RequestInit, Response} from 'node-fetch'

export type Middleware = (url: RequestInfo, init?: RequestInit, next?: (url: RequestInfo, init?: RequestInit) => Promise<Response>) => Promise<Response>
