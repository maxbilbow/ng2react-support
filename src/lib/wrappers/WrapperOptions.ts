import { IModule } from 'angular'
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

type RequireControllers<T extends FC> = Partial<{
  [key in keyof FCProps<T>]: string
}>

type NoProps = undefined | Record<string, never>

export type WrapperOptions<T extends FC> = {
  name: string
  module?: IModule
  bindings?: FCProps<T> extends NoProps ? never : Bindings<T>
  /**
   * @deprecated Injecting Angular controllers into react components creates state-management issues.
   *             Recomended to pass data via props instead.
   */
  require?: FCProps<T> extends NoProps ? never : RequireControllers<T>
}
