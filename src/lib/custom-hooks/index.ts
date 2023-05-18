import type { translate } from 'angular'
import { useMemo } from 'react'
import { getAngularService, getService } from '../ServiceProvider'

/**
 * Hook that returns a service once for the life of a component
 */
export const useService = ((...params: Parameters<typeof getService>) => {
    return useMemo(() => getService(...params), [])
}) as typeof getService

/**
 * @see NgTranslate for a better way to do this.
 */
export function useTranslate() {
    const $translate = useMemo(() => getAngularService<translate.ITranslateService>('$translate'), [])
    return (id: string, subs?: unknown) => $translate.instant(id, subs)
}
