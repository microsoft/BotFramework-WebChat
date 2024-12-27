const SET_CONTINUOUS_LISTENING = 'WEB_CHAT/SET_CONTINUOUS_LISTENING';

export default function setContinuousListening(continuousListening) {
  return {
    type: SET_CONTINUOUS_LISTENING,
    payload: { continuousListening }
  };
}

export { SET_CONTINUOUS_LISTENING };
