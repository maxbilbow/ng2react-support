import React from 'react'
import { angularize } from '../lib/index'

type MyProps = {
    value: string
    value2: string
    value3: string | undefined
    value4?: boolean
    onValueChange: (value: string) => void
}

const MyFC = (props: MyProps) => {
    return <></>
}

angularize(MyFC, {
    name: 'myFC',
    bindings: {
        value: ['=', 'onValueChange'],
        value2: '<',
    },
})
