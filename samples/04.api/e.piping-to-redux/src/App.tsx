import React, { memo, useMemo, type CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ReactWebChat from './WebChat';
import type { State } from './redux/State';

function App() {
  const backgroundColor = useSelector<State, CSSProperties['backgroundColor']>(state => state.backgroundColor);
  const dispatch = useDispatch();
  const style = useMemo<CSSProperties>(() => ({ backgroundColor }), [backgroundColor]);

  return (
    <div id="app" style={style}>
      <ReactWebChat appDispatch={dispatch} />
    </div>
  );
}

export default memo(App);
