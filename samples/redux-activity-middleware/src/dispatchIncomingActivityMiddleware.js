export default function (dispatch) {
  return () => next => action => {
    if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
      const { activity } = action.payload;

      if (
        activity.type === 'event'
        && activity.from.role === 'bot'
        && activity.name === 'redux action'
      ) {
        dispatch(activity.value);
      }
    }

    return next(action);
  };
}
