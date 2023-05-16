import type { IDirectiveLinkFn, IModule, IScope } from 'angular'
import * as React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import type { BindingType, FC, FCProps, PropsCallbackName, WrapperOptions } from './WrapperOptions'

type DirectiveOptions<T extends FC> = {
    scopeBindings?: Record<string, BindingType>
    onChangeHandlers?: [keyof FCProps<T>, PropsCallbackName<T>][]
    require?: WrapperOptions<T>['require']
    replace?: boolean
}

const logger = console

// eslint-disable-next-line @typescript-eslint/naming-convention
export function angularizeDirective<T extends FC>(
    Component: T,
    directiveName: string,
    angularApp: IModule,
    options: DirectiveOptions<T>
) {
    if (typeof window === 'undefined' || typeof angularApp === 'undefined') {
        return
    }
    const { scopeBindings = {}, require: requiredControllers = {}, replace = false, onChangeHandlers = [] } = options
    angularApp.directive(directiveName, () => ({
        scope: scopeBindings,
        replace,
        require: requiredControllers,
        /**
         * @this {import("angular").IDirective & Record<string, any>}
         * @param {import("angular").IScope & Record<string, any>} scope
         * @param $element
         * @param attrs
         * @param {{[key: string]: import("angular").IController}} [ctrl]
         */
        link: function (this: IDirectiveLinkFn, scope: IScope & Record<string, unknown>, $element, attrs, ctrl) {
            // Add $scope
            Object.assign(scope, ctrl)

            // Tech Debt: Why is $scope added here?
            scope.$scope = scope
            const root = ReactDOMClient.createRoot($element[0])

            scope.$on('$destroy', () => root.unmount())

            // Watch for any changes in bindings, then rerender
            const keys = Object.keys(scopeBindings).filter((bindingKey) => {
                if (/^data[A-Z]/.test(bindingKey)) {
                    logger.warn(
                        // eslint-disable-next-line max-len
                        `"${bindingKey}" binding for ${directiveName} directive will be undefined because AngularJS ignores attributes starting with data-`
                    )
                    return false
                }
                return !scopeBindings[bindingKey].includes('&')
            })

            scope.$watchGroup(keys, () => renderReact())

            for (const [propName, callbackName] of onChangeHandlers) {
                logger.debug(`Adding onChange handler for ${propName as string} to ${callbackName}`)
                scope[callbackName as string] = (newValue: unknown) => {
                    scope.$applyAsync(() => {
                        scope[propName as string] = newValue
                    })
                }
            }

            // First render - needed?
            renderReact()

            function renderReact() {
                root.render(React.createElement(Component, scope))
            }
        },
    }))
}
