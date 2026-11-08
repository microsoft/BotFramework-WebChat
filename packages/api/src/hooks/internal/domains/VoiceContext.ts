import { type VoiceHandler, type VoiceState, type WebChatActivity } from 'botframework-webchat-core';

import { type Source } from './Source';
import createDomainContext from './private/createDomainContext';

type VoiceContextType = {
  readonly microphoneMuted: Source<boolean>;
  readonly postVoiceActivity: (activity: WebChatActivity) => void;
  /** Registers a voice handler for audio playback, returns a function to unregister it. */
  readonly registerVoiceHandler: (voiceHandler: VoiceHandler) => () => void;
  readonly setMuted: (muted: boolean) => void;
  readonly setVoiceState: (state: VoiceState) => void;
  readonly startVoice: () => void;
  /** Stops recording. `<Composer>` also stops the audio of every voice handler before calling it. */
  readonly stopVoice: () => void;
  readonly voiceHandlers: Source<ReadonlyMap<string, VoiceHandler>>;
  readonly voiceState: Source<VoiceState>;
};

const [VoiceContext, useVoiceContext] = createDomainContext<VoiceContextType>('WebChatVoiceContext');

export default VoiceContext;
export { useVoiceContext, type VoiceContextType };
