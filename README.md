# ng2react-support

Library of helper utils for AngularJS to React migration

Based on code found in [react-in-angularjs](https://github.com/xjpro/react-in-angularjs)

## Installation

```bash
npm install --save @ng2react/support
```

## Usage

### Convert your AngularJS component or directive to React

You may do this manually or with the help of the [ng2react vscode extension](https://marketplace.visualstudio.com/items?itemName=maxbilbow.ng2react-vscode)

```jsx
// React Component
import React, { useState } from 'react'
import { useService, NgTranslate } from '@ng2react/support'

const MyReactComponent = ({ title, myController }) => {
  const myService = useService('myService')
  const [state, setState] = useState(myService.getState())
  return (
    <>
      <h1>{title}</h1>
      <p>{state}</p>
      <p>
        <NgTranslate id={'TRANLATED_TEXT_ID'} substitutions={myController.getValue()} />
      </p>
    </>
  )
}
```

### Wrap your React component

```js
// AngularJS Component
import * as angular from 'angular'
import { angularize } from '@ng2react/support'
import { MyReactComponent } from './MyReactComponent.jsx'

const myApp = angular.module('myApp', [])
angularize(MyReactElement, {
  module: myApp,
  name: 'myAngularComponent',
  bindings: {
    title: '@',
  },
  require: {
    myController: '^myController',
  },
})
```

### 2-Way Bindings

2-way bindings will not work automatically in react. To maintain this behaviour, you will have to
manually call an update callback from within the React component and trigger the Angular digest cycle
from the parent.

`angularize` can handle this for you:

```tsx
const MyReactComponent = ({ myState, updateMyState }) => {
  return <input onChange={(e) => updateMyState(e.target.value)} value={myState} />
}

angularize(MyReactElement, {
  name: 'myAngularComponent',
  bindings: {
    myState: ['=', 'updateMyState'],
  },
})
```
