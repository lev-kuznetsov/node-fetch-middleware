import {compose, Middleware} from '../src'
import {sandbox} from 'sinon'
import {Response} from 'node-fetch'
import * as nock from 'nock'
import 'should'
import 'should-sinon'

declare module 'node-fetch' {interface Response {testProp: number}}

describe('Compose', () => {
  describe('when all middleware resolves', () => {
    it('should chain middleware in sequence', async () => {
      const [m1, m2, m3]: Middleware[] = [
        async (url, init, next) => {
          init.should.have.properties({body: '0'})
          init.body = '1'
          const response = await next(url, init)
          response.should.have.properties({testProp: 2})
          response.testProp = 1
          return response
        },
        async (url, init, next) => {
          init.should.have.properties({body: '1'})
          init.body = '2'
          const response = await next(url, init)
          response.should.have.properties({testProp: 3})
          response.testProp = 2
          return response
        },
        async (url, init, next) => {
          init.should.have.properties({body: '2'})
          init.body = '3'
          const response = await next(url, init)
          response.should.have.properties({status: 200})
          response.testProp = 3
          return response
        }
      ]
      nock('http://yolo').post('/foo').reply(200, 'ok')
      const response = await compose([m1, m2, m3])('http://yolo/foo', {body: '0', method: 'POST'})
      response.should.have.properties({testProp: 1})
      await response.text().should.be.fulfilledWith('ok')
    })
  })

  describe('when a middleware rejects', () => {
    it('should short chain', async () => {
      const [m1, m2, m3]: Middleware[] = [
        async (url, init, next) => {
          init.should.have.properties({body: '9'})
          init.body = '1'
          await next(url, init).should.be.rejectedWith('oops')
          throw new Error('foo')
        },
        async (url, init, next) => {
          init.should.have.properties({body: '1'})
          throw new Error('oops')
        },
        async (url, init, next) => {
          throw new Error('should not reach third middleware')
        }
      ]
      await compose([m1, m2, m3])('', {body: '9'}).should.be.rejectedWith('foo')
    })
  })
})
