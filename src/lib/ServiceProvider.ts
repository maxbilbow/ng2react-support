const globalServices = new Map<string, unknown>()

type ServiceName<T extends string> = T extends `$${infer S}` ? never : T
type AngularServiceName<T extends string> = T extends `$${infer S}` ? T : never

/**
 * Method for registering a service
 * Throws an error if the service is a known angular service; these should not be used outside angular.
 * Instead, you should wrap them in an abstracted service.
 */
export function getService<T, TName extends string>(name: ServiceName<TName>): T
/**
 * @deprecated Do not inject Angular services into react code. Instead, find an alternative or create a wrapper
 */
export function getService<T, TName extends string>(
  name: AngularServiceName<TName>,
  options: { allowUnsafeAngularService: true }
): T
export function getService<T>(name: string, { allowUnsafeAngularService = false } = {}): T {
  if (name.startsWith('$') && !allowUnsafeAngularService) {
    throw Error(
      // eslint-disable-next-line max-len
      `${name} looks like an angular service. Do not try to retrieve these outside of the angular framework. Create an abstracted wrapper instead.`
    )
  }

  const service = findService(name)
  if (!service) {
    throw Error(`${name} not registered`)
  }
  return service as T
}

function findService(name: string) {
  if (globalServices.has(name) || typeof window === 'undefined' || typeof window.angular === 'undefined') {
    return globalServices.get(name)
  }
  return getAngularService(name)
}

/**
 * Method for retrieving an Angular service
 */
export function getAngularService<T>(name: string): T {
  return window.angular.element(document.body).injector().get(name)
}
