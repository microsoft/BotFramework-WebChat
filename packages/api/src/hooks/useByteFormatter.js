/* eslint no-magic-numbers: ["error", { "ignore": [1024, 1048576, 1073741824] }] */

import { useMemo } from 'react';
import useLocalizedGlobalize from './internal/useLocalizedGlobalize';

const KILOBYTE = 1024;
const MEGABYTE = 1048576;
const GIGABYTE = 1073741824;

const LONG_FORM = {
  form: 'long'
};

const SHORT_FORM = {
  form: 'short'
};

export default function useByteFormatter() {
  const [globalize] = useLocalizedGlobalize();

  return useMemo(() => {
    const unitFormatter = globalize.unitFormatter.bind(globalize);

    return bytes => {
      if (bytes < KILOBYTE) {
        return unitFormatter('byte', LONG_FORM)(bytes);
      } else if (bytes < MEGABYTE) {
        return unitFormatter('kilobyte', SHORT_FORM)(~~(bytes / KILOBYTE));
      } else if (bytes < GIGABYTE) {
        return unitFormatter('megabyte', SHORT_FORM)(~~(bytes / MEGABYTE));
      }

      return unitFormatter('gigabyte', SHORT_FORM)(~~(bytes / GIGABYTE));
    };
  }, [globalize]);
}
