import { type Dispatch, type SetStateAction, useContext, useMemo } from 'react';

import Context from './private/Context';

export default function useShown(): readonly [boolean, Dispatch<SetStateAction<boolean>>] {
  const { setShown, shown } = useContext(Context);

  return useMemo(() => Object.freeze([shown, setShown]), [shown, setShown]);
}
