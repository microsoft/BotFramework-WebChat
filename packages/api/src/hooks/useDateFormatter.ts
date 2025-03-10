import { useMemo } from 'react';

import useLocalizedGlobalize from './internal/useLocalizedGlobalize';
import usePonyfill from './usePonyfill';

// False positive: we are using `Date` as a type.
// eslint-disable-next-line no-restricted-globals
export default function useDateFormatter(): (date: Date | number | string) => string {
  const [{ Date }] = usePonyfill();
  const [globalize] = useLocalizedGlobalize();

  const formatDate = useMemo(
    () => date => globalize.dateFormatter({ skeleton: 'MMMMdhm' })(new Date(date)),
    [Date, globalize]
  );

  return formatDate;
}
