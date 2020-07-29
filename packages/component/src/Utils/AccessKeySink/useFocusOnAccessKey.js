import { useEffect, useRef } from 'react';
import random from 'math-random';

import useContext from './internal/useContext';

function removeInline(array, item) {
  const index = array.indexOf(item);

  ~index && array.splice(index, 1);
}

export default function useFocusOnAccessKey(key, ref) {
  const id = useRef(() =>
    random()
      .toString(36)
      .substr(2, 5)
  );

  const context = useContext();

  useEffect(() => {
    const entry = { key, ref };

    context.focii.splice(0, 0, entry);

    return () => removeInline(context.focii, entry);
  }, [context]);
}
