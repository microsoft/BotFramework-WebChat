import { createStore } from 'botframework-webchat';
import React, { memo, useCallback, useMemo } from 'react';
import { useStateWithRef } from 'use-state-with-ref';

import SendHistory from './SendHistory';
import WebChat from './WebChat';

function App() {
  const [, setIsDirty, isDirtyRef] = useStateWithRef(false);

  const history = useMemo(() => new SendHistory(), []);

  const store = useMemo(
    () =>
      createStore({}, () => next => action => {
        if (action.type === 'WEB_CHAT/SEND_MESSAGE') {
          // add to history
          history.add(action.payload.text);
        } else if (!action.fromHistory && action.type === 'WEB_CHAT/SET_SEND_BOX') {
          // sendbox was modified by the user, not history
          setIsDirty(action.payload.text !== '');
          history.reset();
        }

        return next(action);
      }),
    [history, setIsDirty]
  );

  const handleKeyDown = useCallback(
    event => {
      const { target } = event;

      if (!isDirtyRef.current && target.dataset.id === 'webchat-sendbox-input') {
        let text;

        switch (event.key) {
          case 'ArrowUp':
            text = history.getNext();
            break;

          case 'ArrowDown':
            text = history.getPrevious();
            break;

          default:
            return;
        }

        if (typeof text === 'string') {
          store.dispatch({
            type: 'WEB_CHAT/SET_SEND_BOX',
            fromHistory: true,
            payload: { text }
          });
        }
      }
    },
    [history, isDirtyRef, store]
  );

  return (
    <div className="app" onKeyDown={handleKeyDown}>
      <WebChat store={store} />
    </div>
  );
}

export default memo(App);
