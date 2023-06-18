import type { translate } from 'angular'
import React, { useEffect, useMemo, useState } from 'react'
import { getAngularService } from '../ServiceProvider'

type Props = {
  children: string
  substitutions?: unknown
}

/**
 * Helper element that uses Angular's translate service to translate a string
 * @returns
 */
const NgTranslate = ({ children, substitutions }: Props) => {
  const $translate = useMemo(() => getAngularService<translate.ITranslateService>('$translate'), [])
  const [text, setText] = useState(children.trim())

  useEffect(() => {
    const update = () => {
      const txKey = children.trim()
      setText($translate.instant(txKey, substitutions))
    }
    if ($translate.isReady()) {
      update()
    } else {
      $translate.onReady(update)
    }
  }, [children, substitutions])

  return <>{text}</>
}

export default NgTranslate
