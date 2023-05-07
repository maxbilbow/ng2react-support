
import type {IController, IDirectiveLinkFn, IModule} from "angular";
import {isEqual, isPlainObject} from "lodash";
import * as React from "react";
import * as ReactDOMClient from "react-dom/client";

const logger = console;

/**
 * @deprecated
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function angularizeComponent(Component: React.ElementType,
                           componentName: string,
                           angularApp: IModule, bindings?: Record<string, string>,
                           requiredControllers?: Record<string, string>) {
    if (typeof window === "undefined" || typeof angularApp === "undefined") {
        return;
    }

    angularApp.component(componentName, {
        bindings,
        require: requiredControllers,
        controller: [
            "$element",
            /**
             * @this {Record<string, any> & Required<import("angular").IController>}
             * @param $element
             */
            function (this: IController, $element) {
                // Create react root for this element
                this.root = ReactDOMClient.createRoot($element[0]);
                this.$onChanges = () => {
                    this.root.render(React.createElement(Component, this));
                };

                this.$onDestroy = () => {
                    this.root.unmount();
                };
                if (!bindings) {
                    return;
                }
                if (!window.angular) {
                    return;
                }
                // Add $scope
                this.$scope = window.angular.element($element).scope();

                // Create a map of objects bound by '='
                // For those that exists, use $doCheck to check them using angular.equals and trigger $onChanges
                const previous: Record<string, unknown> = {};
                this.$onInit = () => {
                    if (!bindings) {
                        return;
                    }
                    for (const bindingKey of Object.keys(bindings)) {
                        if (/^data[A-Z]/.test(bindingKey)) {
                            logger.warn(
                                // eslint-disable-next-line max-len
                                `'${bindingKey}' binding for ${componentName} component will be undefined because AngularJS ignores attributes starting with data-`
                            );
                        }

                        if (bindings[bindingKey]?.includes("=")) {
                            previous[bindingKey] = window.angular.copy(this[bindingKey]);
                        }
                    }
                };

                this.$doCheck = () => {
                    for (const previousKey of Object.keys(previous)) {
                        if (!equals(this[previousKey], previous[previousKey])) {
                            this.$onChanges?.({});
                            previous[previousKey] = window.angular.copy(this[previousKey]);
                            return;
                        }
                    }
                };
            }
        ]
    });
}

/**
 * @deprecated
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function angularizeDirective(Component: React.ElementType,
                                    directiveName: string,
                                    angularApp: IModule, bindings?: Record<string, string>,
                                    requiredControllers?: Record<string, string>) {
    if (typeof window === "undefined" || typeof angularApp === "undefined") {
        return;
    }

    angularApp.directive(directiveName, () => {
        return {
            scope: bindings,
            replace: true,
            require: requiredControllers,
            /**
             * @this {import("angular").IDirective & Record<string, any>}
             * @param {import("angular").IScope & Record<string, any>} scope
             * @param $element
             * @param attrs
             * @param {{[key: string]: import("angular").IController}} [ctrl]
             */
            link: function (this: IDirectiveLinkFn, scope, $element, attrs, ctrl) {
                // Add $scope
                Object.assign(scope, ctrl);

                // Tech Debt: Why is $scope added here?
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (scope as any).$scope = scope;
                const root = ReactDOMClient.createRoot($element[0]);

                // First render - needed?
                root.render(React.createElement(Component, scope));

                scope.$on("$destroy", () => {
                    root.unmount();
                });

                if (!bindings) {
                    return;
                }
                // Watch for any changes in bindings, then rerender
                const keys: string[] = [];
                for (const bindingKey of Object.keys(bindings)) {
                    if (/^data[A-Z]/.test(bindingKey)) {
                        logger.warn(
                            // eslint-disable-next-line max-len
                            `"${bindingKey}" binding for ${directiveName} directive will be undefined because AngularJS ignores attributes starting with data-`
                        );
                    }
                    if (!bindings[bindingKey].includes("&")) {
                        keys.push(bindingKey);
                    }
                }

                // TECH DEBT: comment out re-use of word "root". Looks like a bug
                scope.$watchGroup(keys, (/* root */) => {
                    root.render(React.createElement(Component, scope));
                });

            }
        };
    });
}

/**
 *
 * @param {unknown} o1
 * @param {unknown} o2
 * @returns {boolean}
 */
function equals(o1: unknown, o2: unknown) {
    // Compare plain objects without equality check that angular.equals does
    if (isPlainObject(o1) && isPlainObject(o2)) {
        return isEqual(o1, o2);
    }
    return window.angular.equals(o1, o2);
}
