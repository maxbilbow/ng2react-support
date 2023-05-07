import { IHttpService, IQService, translate, ILogService, IFilterService } from 'angular';

const globalServices = new Map<string, unknown>();

type ServiceName = Exclude<string, `$${string}`>;

/**
 * Method for registering a service
 * Throws an error if the service is a known angular service; these should not be used outside angular.
 * Instead, you should wrap them in an abstracted service.
 */
export function getService<T>(name: ServiceName): T;
export function getService(
  angularServiceName: '$translate',
  ngOverride: { allowUnsafeAngularService: true }
): translate.ITranslateService;
export function getService(angularServiceName: '$http', ngOverride: { allowUnsafeAngularService: true }): IHttpService;
export function getService(angularServiceName: '$q', ngOverride: { allowUnsafeAngularService: true }): IQService;
export function getService(angularServiceName: '$log', ngOverride: { allowUnsafeAngularService: true }): ILogService;
export function getService(
  angularServiceName: '$filter',
  ngOverride: { allowUnsafeAngularService: true }
): IFilterService;
export function getService(angularServiceName: '$translate'): never;
export function getService(angularServiceName: '$http'): never;
export function getService(angularServiceName: '$q'): never;
export function getService(angularServiceName: '$log'): never;
export function getService(angularServiceName: '$filter'): never;
export function getService<T>(name: ServiceName, { allowUnsafeAngularService = false } = {}): T {
  if (name.startsWith('$') && !allowUnsafeAngularService) {
    throw Error(
      // eslint-disable-next-line max-len
      `${name} looks like an angular service. Do not try to retrieve these outside of the angular framework. Create an abstracted wrapper instead.`
    );
  }

  const service = findService(name);
  if (!service) {
    throw Error(`${name} not registered`);
  }
  return service as T;
}

function findService(name: string) {
  if (globalServices.has(name) || typeof window === 'undefined' || typeof window.angular === 'undefined') {
    return globalServices.get(name);
  }
  return getAngularService(name);
}

/**
 * Method for retrieving an Angular service
 */
export function getAngularService<T>(name: string): T {
  return window.angular.element(document.body).injector().get(name);
}
