import type { translate } from 'angular';
import React, { useMemo } from 'react';
import { getAngularService } from '../ServiceProvider';

type Props = {
  id: string;
  substitutions?: unknown;
};

/**
 * Helper element that uses Angular's translate service to translate a string
 * @returns
 */
const NgTranslate = ({ id, substitutions }: Props) => {
  const $translate = useMemo(
    () => getAngularService<translate.ITranslateService>('$translate'),
    []
  );

  return <>{$translate.instant(id, substitutions)}</>;
};

export default NgTranslate;
