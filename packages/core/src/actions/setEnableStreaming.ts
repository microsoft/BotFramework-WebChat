const SET_ENABLE_STREAMING = 'WEB_CHAT/SET_ENABLE_STREAMING';

export default function setEnableStreaming(enableStreaming: boolean) {
  return {
    type: SET_ENABLE_STREAMING,
    payload: { enableStreaming }
  };
}

export { SET_ENABLE_STREAMING };
