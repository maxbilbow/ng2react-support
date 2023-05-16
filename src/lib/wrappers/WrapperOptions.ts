import { IModule } from 'angular'
import type { FunctionComponent } from 'react'

export type FC<T = any> = FunctionComponent<T>
export type FCProps<T extends FC> = Required<Parameters<T>['0']>

type MethodNamesOf<T extends object> = {
  [K in keyof T]: T[K] extends (newValue: infer V) => void ? K : never
}[keyof T]

export type PropsCallbackName<T extends FC> = MethodNamesOf<FCProps<T>> & string

type RequiredBindingType = '&' | '=' | '@' | '<'
type OptionalBindingType = `?${RequiredBindingType}`
export type BindingType = RequiredBindingType | OptionalBindingType
export type OneWayBindingType = Exclude<BindingType, '=' | '?='>
export type TwoWayBindingType = Extract<BindingType, '=' | '?='>

export type TwoWayBindingTuple<T extends FC> = [TwoWayBindingType, PropsCallbackName<T>]
type Bindings<T extends FC> = Partial<{
  [key in keyof FCProps<T>]: OneWayBindingType | TwoWayBindingTuple<T>
}>
export type WrapperOptions<T extends FC> = {
  name: string
  module?: IModule
  bindings?: Bindings<T>
  require?: Partial<{
    [key in keyof FCProps<T>]: string
  }>
  replace?: boolean
}
