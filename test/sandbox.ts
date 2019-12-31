import {createSandbox} from 'sinon'

export const sandbox = createSandbox()

afterEach(() => sandbox.restore())
