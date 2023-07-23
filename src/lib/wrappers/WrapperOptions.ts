import { IController, IModule } from 'angular'
import type { FunctionComponent } from 'react'

export type FC<T = any> = FunctionComponent<T>
export type FCProps<T extends FC> = T extends FC<infer TProps> ? TProps : Required<Parameters<T>['0']>

type MethodNamesOf<T extends object> = {
  [K in keyof T]: T[K] extends (newValue: infer V) => void ? K : never
}[keyof T]

export type PropsCallbackName<T extends FC> = MethodNamesOf<FCProps<T>> & string

type RequiredBindingType = '&' | '=' | '@' | '<'
type OptionalBindingType = `?${RequiredBindingType}`
export type BindingType = RequiredBindingType | OptionalBindingType
export type TwoWayBindingType = '=' | '?='
export type OneWayBindingType = Exclude<BindingType, TwoWayBindingType>

export type TwoWayBindingTuple<T extends FC> = [TwoWayBindingType, PropsCallbackName<T>]

type Bindings<T extends FC> = Partial<{
  [key in keyof FCProps<T>]: OneWayBindingType | TwoWayBindingTuple<T>
}>

/**
 * Functions that return watchable values for a controller
 */
export type CtrlWatchFunction<T> = (ctrl: T) => () => unknown

export type CtrlOptions<T> = {
  name: string
  watch: CtrlWatchFunction<T> | CtrlWatchFunction<T>[]
}

type RequireControllers<T extends FC> = Partial<{
  [key in keyof FCProps<T>]: string | CtrlOptions<unknown>
}>

type NoProps = undefined | Record<string, never>

export type WrapperOptions<T extends FC> = {
  name: string
  module?: IModule
  bindings?: FCProps<T> extends NoProps ? never : Bindings<T>
  require?: FCProps<T> extends NoProps ? never : RequireControllers<T>
  /**
   * @deprecated This currently does not work (for now)
   *             so best you don't use it and just adjust you CSS for the additional component wrapper
   */
  replace?: never //`<${string}></${string}>`
}
