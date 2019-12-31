import {cache} from '../src'
import {sandbox} from './sandbox'
import {Response} from 'node-fetch'
import * as Cache from 'node-cache'
import 'should'
import 'should-sinon'

describe('Caching middleware', () => {
  let next, middleware, buffer, r1, r2

  before(() => {
    buffer = new Cache()
    middleware = cache({cache: buffer})
    next = sandbox.stub()
      .onCall(0).resolves(r1 = new Response('ok', {status: 200}))
      .onCall(1).resolves(r2 = new Response('ok again', {status: 200}))
  })

  describe('when making two requests in quick succession and then making another one after cache expires', () => {
    it('should resolve all, hit cache on second call', async () => {
      await middleware('url', null, next).should.be.resolvedWith(r1)
      next.should.have.been.calledOnce()
      await middleware('url', null, next).should.be.resolvedWith(r1)
      next.should.have.been.calledOnce()
      buffer.del('url')
      await middleware('url', null, next).should.be.resolvedWith(r2)
      next.should.have.been.calledTwice()
    })
  })
})
