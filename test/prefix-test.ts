import {prefix} from '../src'
import {sandbox} from './sandbox'
import {Request, Response} from 'node-fetch'
import 'should'
import 'should-sinon'

describe('Prefix middleware', () => {
  let next, response

  beforeEach(() => next = sandbox.stub().resolves(response = new Response()))

  afterEach(() => next.should.have.been.calledOnce())

  describe('with default test', () => {
    const middleware = prefix('http://oloy')

    describe('and an applicable url', () => {
      const uri = '/yolo'

      describe('supplied as a string', () => {
        const url = uri

        it('should apply', async () => {
          await middleware(url, null, next)
          next.should.have.been.calledWith('http://oloy/yolo')
        })
      })

      describe('supplied as URLLike', () => {
        const url = {href: uri}

        it('should apply', async () => {
          await middleware(url, null, next)
          next.should.have.been.calledWith({href: 'http://oloy/yolo'})
        })
      })

      describe('supplied as Request', () => {
        const url = new Request(uri)

        it('should apply', async () => {
          await middleware(url, undefined, next)
          next.lastCall.args[0].should.have.properties({url: 'http://oloy/yolo'})
        })
      })
    })

    describe('and a non-applicable url', () =>{
      const url = 'yolo'

      it('should not apply', async () => {
        await middleware(url, null, next)
        next.should.have.been.calledWith('yolo')
      })
    })
  })

  describe('with a custom test', () => {
    const middleware = prefix('http://yolo/', {test: string => string.endsWith('.yes')})

    describe('and an applicable url', () => {
      const url = 'file.yes'

      it('should apply', async () => {
        await middleware(url, null, next)
        next.should.have.been.calledWith('http://yolo/file.yes')
      })
    })

    describe('and an non-applicable url', () => {
      const url = 'file.no'

      it('should apply', async () => {
        await middleware(url, null, next)
        next.should.have.been.calledWith('file.no')
      })
    })
  })
})
