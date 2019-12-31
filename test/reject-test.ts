import {sandbox} from './sandbox'
import {reject} from '../src'
import 'should'
import 'should-sinon'
import {Response} from "node-fetch";

describe('Reject middleware', () => {
  let next, response

  beforeEach(() => next = sandbox.stub())

  afterEach(() => next.should.have.been.calledOnce())

  describe('with a default test', () => {
    const middleware = reject()

    describe('when next resolves with a 200', () => {
      beforeEach(() => next.resolves(new Response('ok', {status: 200})))

      it('should resolve', () => middleware('url', null, next))
    })

    describe('when next resolves with a 500', () => {
      beforeEach(() => next.resolves(new Response('oops', {status: 500})))

      it('should reject', () => middleware('url', null, next).should.be.rejectedWith('Internal Server Error'))
    })
  })

  describe('with a custom test', () => {
    const middleware = reject({test: ({status}) => status !== 200})

    describe('when next resolves with a passing response', () => {
      beforeEach(() => next.resolves(new Response('ok', {status: 200})))

      it('should resolve', () => middleware('url', null, next))
    })

    describe('when next resolves with a rejecting response', () => {
      beforeEach(() => next.resolves(new Response('oops', {status: 202})))

      it('should reject', () => middleware('url', null, next).should.be.rejectedWith('Accepted'))
    })
  })
})
