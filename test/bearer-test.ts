import {bearer} from '../src'
import {Response} from 'node-fetch'
import {sandbox} from './sandbox'
import 'should'
import 'should-sinon'

describe('Bearer token middleware', () => {
  let next, provider = async () => 'foo', middleware = bearer({provider})

  beforeEach(() => next = sandbox.stub().resolves(new Response()))

  afterEach(() => next.should.have.been.calledWith('url', {headers: {'Authorization': 'Bearer foo'}}))

  describe('with init', () => {
    it('should resolve', () => middleware('url', {}, next))
  })

  describe('without init', () => {
    it('should resolve', () => middleware('url', null, next))
  })
})
