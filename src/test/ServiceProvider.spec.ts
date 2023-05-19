import { afterAll, beforeAll, describe, it } from '@jest/globals'
import * as assert from 'assert'
import { getService } from '../lib/ServiceProvider'
import { MOCK_HTTP_SERVICE, mockAngular, unMock } from './helpers/mocks'

describe('Given angular is present', () => {
    beforeAll(() => mockAngular({ myService: true }))
    afterAll(unMock)
    it('When getService is called for an existing service Then that service is returned', () => {
        expect(getService('myService')).toBe(true)
    })

    it('When getService is called for a missing service Then an error is thrown', () => {
        try {
            getService('notThere')
            assert.fail('Error expected')
        } catch (e) {
            // OK
        }
    })

    it('When getService is called for an angular service Then an error is thrown', () => {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore Because this is what we are testing
            getService('$http')
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore Because this is what we are testing
            assert.fail('Error expected')
        } catch (e) {
            expect((e as Error).message).toContain('angular')
        }
    })

    it('When getService is called for an angular service with the allowUnsafeAngularService flag Then an error is not thrown', () => {
        expect(getService('$http', { allowUnsafeAngularService: true })).toBe(MOCK_HTTP_SERVICE)
    })
})
