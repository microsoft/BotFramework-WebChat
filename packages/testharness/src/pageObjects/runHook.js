import dispatchAction from './internal/dispatchAction';

export default function runHook(fn) {
  return new Promise(resolve =>
    dispatchAction({ type: 'WEB_CHAT/SEND_EVENT', payload: { name: '__RUN_HOOK', value: { fn, resolve } } })
  );
}
