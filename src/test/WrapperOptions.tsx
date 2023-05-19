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
