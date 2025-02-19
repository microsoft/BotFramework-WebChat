const SET_BOT_SPEAKING = 'SET_BOT_SPEAKING';

export default function setBotSpeakingState(botSpeaking) {
  return {
    type: SET_BOT_SPEAKING,
    payload: { botSpeaking }
  };
}

export { SET_BOT_SPEAKING };
