import type { IDirectiveLinkFn, IModule } from 'angular';
import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';

export type WrapperOptions = {
  bindings?: Record<string, string>;
  require?: Record<string, string>;
  // transclude?: boolean;
  replace?: boolean;
};

const logger = console;

// eslint-disable-next-line @typescript-eslint/naming-convention
export function angularizeDirective(
  Component: React.ElementType,
  directiveName: string,
  angularApp: IModule,
  options: WrapperOptions
) {
  if (typeof window === 'undefined' || typeof angularApp === 'undefined') {
    return;
  }
  const { bindings, require: requiredControllers, replace } = options;
  angularApp.directive(directiveName, () => ({
    scope: bindings,
    replace,
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
      renderReact();

      scope.$on('$destroy', () => root.unmount());

      if (!bindings) {
        return;
      }

      // Watch for any changes in bindings, then rerender
      const keys = Object.keys(bindings).filter((bindingKey) => {
        if (/^data[A-Z]/.test(bindingKey)) {
          logger.warn(
            // eslint-disable-next-line max-len
            `"${bindingKey}" binding for ${directiveName} directive will be undefined because AngularJS ignores attributes starting with data-`
          );
          return false;
        }
        return !bindings[bindingKey].includes('&');
      });

      // TECH DEBT: comment out re-use of word "root". Looks like a bug
      scope.$watchGroup(keys, (/* root */) => renderReact());

      function renderReact() {
        root.render(React.createElement(Component, scope));
      }
    },
  }));
}
