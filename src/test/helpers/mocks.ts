export const MOCK_LOGGER = 'MOCK_LOGGER' as unknown,
    MOCK_HTTP_SERVICE = 'MOCK_HTTP_SERVICE' as unknown

function defaultTranslate() {
    return {
        instant: (s: string) => s,
    }
}

export function mockAngular(serviceMap: Record<string, any> = {}) {
    serviceMap.$translate ??= defaultTranslate()
    serviceMap.$log ??= { getLogger: () => MOCK_LOGGER }
    serviceMap.$http ??= MOCK_HTTP_SERVICE
    window.angular = {
        element: () => ({
            injector: () => ({
                get: (name: string) => {
                    if (!serviceMap[name]) {
                        throw Error(`Mock Error: ${name} not found`)
                    }
                    return serviceMap[name]
                },
            }),
        }),
    } as any
}

export function unMock() {
    delete (window as any).angular
}
