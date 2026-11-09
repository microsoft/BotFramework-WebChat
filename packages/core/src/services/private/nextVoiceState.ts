import type { VoiceHandler } from '../../types/VoiceHandler';
import type { VoiceState } from '../../types/VoiceState';

/** The `voice` slice of speech-to-speech: mute, state and the handlers playing the audio, by ID. */
type VoiceSlice = {
  readonly microphoneMuted: boolean;
  /** A new map on every change: never changed in place. */
  readonly voiceHandlers: Map<string, VoiceHandler>;
  readonly voiceState: VoiceState;
};

/** The changes of the `voice` slice, one per action of the `voiceActivity` reducer. */
type VoiceOperation =
  | { readonly type: 'mute' }
  | { readonly type: 'register'; readonly id: string; readonly voiceHandler: VoiceHandler }
  | { readonly type: 'setState'; readonly voiceState: VoiceState }
  | { readonly type: 'start' }
  | { readonly type: 'stop' }
  | { readonly type: 'unmute' }
  | { readonly type: 'unregister'; readonly id: string };

/**
 * The next `voice` slice, as the `voiceActivity` reducer: always a new object.
 *
 * Quirks kept on purpose (to fix in both modes later):
 *
 * - starting while not idle warns, and starts anyway;
 * - starting and stopping unmute;
 * - every register and unregister makes a new map of handlers, also when nothing is removed.
 */
export default function nextVoiceState(state: VoiceSlice, operation: VoiceOperation): VoiceSlice {
  switch (operation.type) {
    case 'mute':
      return { ...state, microphoneMuted: true };

    case 'register': {
      const voiceHandlers = new Map(state.voiceHandlers);

      voiceHandlers.set(operation.id, operation.voiceHandler);

      return { ...state, voiceHandlers };
    }

    case 'unregister': {
      const voiceHandlers = new Map(state.voiceHandlers);

      voiceHandlers.delete(operation.id);

      return { ...state, voiceHandlers };
    }

    case 'setState':
      return { ...state, voiceState: operation.voiceState };

    case 'start':
      if (state.voiceState !== 'idle') {
        console.warn(`botframework-webchat: Should not transit from "${state.voiceState}" to "listening"`);
      }

      return { ...state, microphoneMuted: false, voiceState: 'listening' };

    case 'stop':
      return { ...state, microphoneMuted: false, voiceState: 'idle' };

    case 'unmute':
      return { ...state, microphoneMuted: false };

    default:
      return state;
  }
}

export type { VoiceOperation, VoiceSlice };
