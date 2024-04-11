import { useContext, useMemo, type Dispatch, type SetStateAction } from 'react';

import Context from './private/Context';

export default function useShown(): readonly [boolean, Dispatch<SetStateAction<boolean>>] {
  const { setShown, shown } = useContext(Context);

  return useMemo(() => Object.freeze([shown, setShown]), [shown, setShown]);
}
