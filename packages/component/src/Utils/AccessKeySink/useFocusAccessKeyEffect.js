import { useEffect } from 'react';

import useAccessKeySinkContext from './internal/useContext';

function removeInline(array, item) {
  const index = array.indexOf(item);

  ~index && array.splice(index, 1);
}

export default function useFocusAccessKeyEffect(key, ref) {
  if (key && typeof key !== 'string') {
    throw new Error('useFocusAccessKeyEffect: If defined, "key" must be of type "string".');
  } else if (!ref || !('current' in ref)) {
    throw new Error('useFocusAccessKeyEffect: "ref" must be defined and has "current" property.');
  }

  const context = useAccessKeySinkContext();

  useEffect(() => {
    if (key) {
      const entry = { keys: key.split(/\s+/gu), ref };

      context.focii.push(entry);

      return () => removeInline(context.focii, entry);
    }
  }, [context, key, ref]);
}
