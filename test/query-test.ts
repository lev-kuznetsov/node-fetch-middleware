import {query as middleware} from '../src'
import {sandbox} from './sandbox'
import 'should'
import 'should-sinon'
import {Response} from 'node-fetch'

describe('Query middleware', () => {
  let next, init, url = 'url'

  beforeEach(() => next = sandbox.stub().resolves(new Response('ok', {status: 200})))

  describe('when query object parameter is provided', () => {
    beforeEach(() => init = {query: {foo: 'bar'}})

    afterEach(() => next.should.have.been.calledWith('url?foo=bar', {}))

    it('should resolve', () => middleware(url, init, next))
  })

  describe('when query string parameter is provided', () => {
    beforeEach(() => init = {query: 'foobar'})

    afterEach(() => next.should.have.been.calledWith('url?foobar', {}))

    it('should resolve', () => middleware(url, init, next))
  })

  describe('when no query parameters are provided', () => {
    afterEach(() => next.should.have.been.calledWith('url', undefined))

    it('should resolve', () => middleware(url, undefined, next))
  })
})
