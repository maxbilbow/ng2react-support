import type { IController, IDirectiveLinkFn, IModule, IScope } from 'angular'
import * as React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import type { BindingType, CtrlOptions, FC, FCProps, PropsCallbackName, WrapperOptions } from './WrapperOptions'

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
  const { scopeBindings = {}, require: requiredControllers, replace = false, onChangeHandlers = [] } = options
  const requiredControllersNameMap = Object.entries(requiredControllers ?? {}).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = value
    } else if (Array.isArray(value)) {
      const [controllerName] = value
      acc[key] = controllerName
    }
    return acc
  }, {} as Record<string, string>)

  angularApp.directive(directiveName, () => ({
    scope: scopeBindings,
    replace,
    require: requiredControllersNameMap,
    /**
     * @this {import("angular").IDirective & Record<string, any>}
     * @param {import("angular").IScope & Record<string, any>} scope
     * @param $element
     * @param attrs
     * @param {{[key: string]: import("angular").IController}} [ctrl]
     */
    link: function (
      this: IDirectiveLinkFn,
      scope: IScope & Record<string, unknown>,
      $element,
      attrs,
      ctrl = {} as Record<string, IController>
    ) {
      // bind controllers to scope
      Object.assign(scope, ctrl)

      Object.entries(requiredControllers ?? {})
        .filter(([key, value]) => ctrl[key] && hasCtrlWatchFunctions(value))
        .map(([key, value]) => {
          const { watch } = value as CtrlOptions<unknown>
          return { controller: ctrl[key], watchers: watch instanceof Array ? watch : [watch] } as const
        })
        .flatMap(({ controller, watchers }) => watchers.map((watcher) => ({ controller, watcher } as const)))
        .forEach(
          ({ controller, watcher }) => scope.$watch(() => watcher(controller)),
          () => renderReact()
        )

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

function hasCtrlWatchFunctions(v: string | CtrlOptions<unknown> | undefined): v is CtrlOptions<unknown> {
  if (!v) {
    return false
  }
  return typeof v !== 'string' && Array.isArray(v.watch)
}
