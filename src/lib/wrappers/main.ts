import angular from 'angular'
import { BindingType, FC, FCProps, PropsCallbackName, WrapperOptions } from './WrapperOptions'
import { angularizeDirective } from './angularizeDirective'

export function angularize<T extends FC>(reactElement: T, { name, module, bindings, ...options }: WrapperOptions<T>) {
  module ??= angular.module(name, [])
  if (!bindings) {
    angularizeDirective(reactElement, name, module, options)
    return module
  }

  const scopeBindings = {} as Record<keyof FCProps<T>, BindingType>
  const onChangeHandlers: [keyof FCProps<T>, PropsCallbackName<T>][] = []
  for (const [key, value] of Object.entries(bindings) as [
    keyof FCProps<T>,
    BindingType | [BindingType, PropsCallbackName<T>]
  ][]) {
    if (typeof value === 'string') {
      scopeBindings[key] = value
    } else if (value) {
      const [bindingType, onChangeCallbackName] = value
      scopeBindings[key] = bindingType
      onChangeHandlers.push([key, onChangeCallbackName])
    }
  }
  angularizeDirective(reactElement, name, module, { scopeBindings, onChangeHandlers, ...options })
  return module
}
