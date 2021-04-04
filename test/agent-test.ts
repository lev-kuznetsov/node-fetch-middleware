import {agent} from '../src'
import {sandbox} from './sandbox'
import {Request, Response} from 'node-fetch'
import 'should'
import 'should-sinon'

describe('User agent middleware', () => {
  let next, response

  beforeEach(() => next = sandbox.stub().resolves(response = new Response()))

  afterEach(() => next.should.have.been.calledOnce())

  describe('with a set agent', () => {
    const middleware = agent('yolo')

    it('should set user agent header', async () => {
      await middleware('https://yolo', null, next)
      next.should.have.been.calledWith('https://yolo', {headers: {'User-Agent': 'yolo'}})
    })
  })
})
