import React from 'react'
import { angularize } from '../lib/index'

type MyProps = {
  value: string
  onValueChange: (value: string) => void
}

const MyFC = (props: MyProps) => {
  return <></>
}

angularize(MyFC, {
  name: 'myFC',
  bindings: {
    value: ['=', 'onValueChange'],
  },
})
