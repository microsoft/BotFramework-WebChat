import { useMemo } from 'react';

import useGlobalize from './internal/useGlobalize';

export default function useDateFormatter() {
  const globalize = useGlobalize();

  const formatDate = useMemo(() => date => globalize.dateFormatter({ skeleton: 'MMMMdhm' })(new Date(date)), [
    globalize
  ]);

  return formatDate;
}
