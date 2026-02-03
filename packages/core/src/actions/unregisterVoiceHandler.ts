const VOICE_UNREGISTER_HANDLER = 'WEB_CHAT/VOICE_UNREGISTER_HANDLER' as const;

type VoiceUnregisterHandlerAction = {
  type: typeof VOICE_UNREGISTER_HANDLER;
  payload: { id: string };
};

function unregisterVoiceHandler(id: string): VoiceUnregisterHandlerAction {
  return {
    type: VOICE_UNREGISTER_HANDLER,
    payload: { id }
  };
}

export default unregisterVoiceHandler;

export { VOICE_UNREGISTER_HANDLER };

export type { VoiceUnregisterHandlerAction };
