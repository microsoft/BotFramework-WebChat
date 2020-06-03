const { createElement } = window.React;

const RunHook = ({ fn, resolve }) => {
  resolve(fn(window.WebChat.hooks));

  return false;
};

function createRunHookActivityMiddleware() {
  return () => next => ({ activity, ...others }) => {
    if (activity.type === 'event' && activity.name === '__RUN_HOOK') {
      return () => !activity.ref.count++ && createElement(RunHook, activity.value);
    }

    return next({ activity, ...others });
  };
}

export default createRunHookActivityMiddleware;
