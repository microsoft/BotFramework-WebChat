import { useCallback, useState } from 'react';

function useForceRender() {
  const [, setForceRender] = useState();

  return useCallback(() => setForceRender({}), [setForceRender]);
}

export default useForceRender;
