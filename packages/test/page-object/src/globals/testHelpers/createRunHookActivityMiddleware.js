const { createElement, memo, useRef } = React;

const RunHook = memo(({ fn, resolve }) => {
  const numCalledRef = useRef(0);

  resolve(fn(window.WebChat.hooks, numCalledRef.current++));

  return false;
});

function createRunHookActivityMiddleware() {
  return () =>
    next =>
    ({ activity, ...others }) => {
      if (activity.type === 'event' && activity.name === '__RUN_HOOK') {
        return () => !activity.ref.count++ && createElement(RunHook, activity.value);
      }

      return next({ activity, ...others });
    };
}

export default createRunHookActivityMiddleware;
