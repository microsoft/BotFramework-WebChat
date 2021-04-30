import dispatchAction from './internal/dispatchAction';

export default function runHook(fn) {
  return new Promise(resolve =>
    dispatchAction({
      type: 'DIRECT_LINE/INCOMING_ACTIVITY',
      payload: {
        activity: {
          from: { role: 'user' },
          name: '__RUN_HOOK',
          ref: { count: 0 },
          timestamp: new Date(0).toISOString(),
          type: 'event',
          value: { fn, resolve }
        }
      }
    })
  );
}
