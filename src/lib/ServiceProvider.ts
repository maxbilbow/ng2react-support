

const globalServices = new Map<string, unknown>();

type ServiceName = Exclude<string, `$${string}`>;

export function getService<T>(name: ServiceName): T;
export function getService(angularServiceName: "$http"): never;
export function getService(angularServiceName: "$q"): never;
export function getService(angularServiceName: "$log"): never;
export function getService(angularServiceName: "$filter"): never;
export function getService<T>(name: ServiceName): T {
    if (name.startsWith("$")) {
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

/**
 * TECH DEBT: Implement better non-angular logging
 */
function findService(name: string) {
    if (globalServices.has(name) || typeof window === "undefined" || typeof window.angular === "undefined") {
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
