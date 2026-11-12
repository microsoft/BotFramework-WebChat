import { type VoiceHandler, type VoiceState, type WebChatActivity } from 'botframework-webchat-core';

import createDomainContext from './private/createDomainContext';

/** The setters of voice. Its microphone muted, voice handlers and voice state are slices: `VoiceSlices`. */
type VoiceContextType = {
  readonly postVoiceActivity: (activity: WebChatActivity) => void;
  /** Registers a voice handler for audio playback, returns a function to unregister it. */
  readonly registerVoiceHandler: (voiceHandler: VoiceHandler) => () => void;
  readonly setMuted: (muted: boolean) => void;
  readonly setVoiceState: (state: VoiceState) => void;
  readonly startVoice: () => void;
  /** Stops recording. `<Composer>` also stops the audio of every voice handler before calling it. */
  readonly stopVoice: () => void;
};

const [VoiceContext, useVoiceContext] = createDomainContext<VoiceContextType>('WebChatVoiceContext');

export default VoiceContext;
export { useVoiceContext, type VoiceContextType };
