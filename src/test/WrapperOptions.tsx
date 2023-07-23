/* eslint-disable @typescript-eslint/naming-convention */

import { angularize } from '../lib'
import * as React from 'react'

type Props = {
  value: string
  value2: bigint
  value3: string
  value4: Algorithm
  value5: BarProp
  onValueChange: (newValue: string) => void
}
const MyElement = (props: Props) => {
  return <>{props}</>
}
const NoProps = () => <></>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EmptyProps = (props: NonNullable<unknown>) => <></>

angularize(MyElement, {
  name: '',
  bindings: {
    value: ['=', 'onValueChange'],
    value2: '=', // not allowed,
    value3: '<',
    value4: ['<', 'notAllowed'],
    value5: '@',
  },
  require: {
    value: {
      name: 'myController',
      watch: (ctrl: any) => ctrl.value,
    },
    value2: {
      name: 'myController',
      watch: [(ctrl: any) => ctrl.value, (ctrl: any) => ctrl.value2],
    },
  },
})

angularize(NoProps, {
  name: '',
  // Not allowed (no bindings)
  bindings: {},
  require: {},
})

angularize(EmptyProps, {
  name: '',
  // Not allowed (no bindings)
  bindings: {},
  require: {},
})

const MyElement2: React.FunctionComponent<Props> = (props) => {
  return <>{props}</>
}

angularize(MyElement, {
  name: '',
  bindings: {
    value: ['=', 'onValueChange'],
    value3: '<',
    value5: '@',
  },
})
