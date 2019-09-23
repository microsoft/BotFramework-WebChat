const SET_BACKGROUND_COLOR = 'SET_BACKGROUND_COLOR';

function setBackgroundColor(color) {
  return {
    type: SET_BACKGROUND_COLOR,
    payload: { color }
  };
}

export { SET_BACKGROUND_COLOR, setBackgroundColor };
