import { IModule } from 'angular';
import * as React from 'react';
import { angularizeDirective, WrapperOptions } from './angularizeDirective';

type AngularizeOptions = WrapperOptions & WrapperOptions & { name: string; module: IModule };

export function angularize(reactElement: React.ElementType, { name, module, ...options }: AngularizeOptions) {
  angularizeDirective(reactElement, name, module, options);
  return module;
}
