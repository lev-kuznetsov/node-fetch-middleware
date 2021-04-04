import {json as middleware} from '../src'
import {Response} from 'node-fetch'
import {sandbox} from './sandbox'
import 'should'
import 'should-sinon'

describe('Json middleware', () => {
  let next

  beforeEach(() => next = sandbox.stub().resolves(new Response('{"bar":"baz"}', {status: 200})))

  afterEach(() => next.should.have.been.calledWith('url', {
    body: '{"foo":"bar"}', json: {foo: 'bar'}, headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
  }))

  it('should resolve', async () => {
    const {parsed} = await middleware('url', {json: {foo: 'bar'}}, next)
    parsed.should.eql({bar: 'baz'})
  })
})
