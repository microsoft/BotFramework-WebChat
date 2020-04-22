const { createElement, useRef } = window.React;

const RunHook = ({ fn, resolve }) => {
  resolve(fn(window.WebChat.hooks));

  return false;
};

const RunHookOnce = props => {
  const renderCount = useRef(0);

  return !renderCount.current++ && createElement(RunHook, props);
};

function createRunHookActivityMiddleware() {
  return () => next => ({ activity, ...others }) => {
    if (activity.type === 'event' && activity.name === '__RUN_HOOK') {
      return () => createElement(RunHookOnce, activity.value);
    }

    return next({ activity, ...others });
  };
}

export default createRunHookActivityMiddleware;
