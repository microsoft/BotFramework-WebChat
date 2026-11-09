import type { VoiceHandler } from '../types/VoiceHandler';
import type { VoiceState } from '../types/VoiceState';
import type { IncomingVoicePort } from './createIncomingService';
import createCell from './private/createCell';
import nextVoiceState, { type VoiceOperation, type VoiceSlice } from './private/nextVoiceState';
import type { Notify, Source } from './types';

type VoiceService = {
  readonly microphoneMuted: Source<boolean>;
  /** For the incoming service: the voice activities received while recording. */
  readonly port: IncomingVoicePort;
  /** As `VOICE_REGISTER_HANDLER`; returns the function that unregisters it (`VOICE_UNREGISTER_HANDLER`). */
  readonly registerVoiceHandler: (id: string, voiceHandler: VoiceHandler) => () => void;
  /** As `VOICE_MUTE_RECORDING` and `VOICE_UNMUTE_RECORDING`. */
  readonly setMuted: (muted: boolean) => void;
  /** As `VOICE_SET_STATE`. */
  readonly setVoiceState: (voiceState: VoiceState) => void;
  /** As `VOICE_START_RECORDING`. */
  readonly startVoice: () => void;
  /** As `VOICE_STOP_RECORDING`. */
  readonly stopVoice: () => void;
  readonly voiceHandlers: Source<ReadonlyMap<string, VoiceHandler>>;
  readonly voiceState: Source<VoiceState>;
};

const INITIAL_STATE: VoiceSlice = Object.freeze({
  microphoneMuted: false,
  voiceHandlers: new Map(),
  voiceState: 'idle'
});

/**
 * Speech-to-speech without Redux: the `voice` slice (mute, state, the handlers playing the audio), as the
 * `voiceActivity` reducer. One value for the three: one operation notifies once, as one action does (stopping while
 * muted changes two of them).
 *
 * The voice activities posted are in the outgoing service (it has the session and the locale).
 */
export default function createVoiceService({
  notify = callListeners => callListeners()
}: {
  readonly notify?: Notify | undefined;
} = {}): VoiceService {
  const voice = createCell<VoiceSlice>(INITIAL_STATE, notify);

  const update = (operation: VoiceOperation) => voice.set(nextVoiceState(voice.get(), operation));

  const select = <T>(get: (slice: VoiceSlice) => T): Source<T> =>
    Object.freeze({ get: () => get(voice.get()), subscribe: voice.subscribe });

  const setVoiceState = (voiceState: VoiceState) => update({ type: 'setState', voiceState });

  return Object.freeze({
    microphoneMuted: select(({ microphoneMuted }) => microphoneMuted),
    port: Object.freeze({
      getVoiceHandlers: () => voice.get().voiceHandlers.values(),
      getVoiceState: () => voice.get().voiceState,
      setVoiceState
    }),
    registerVoiceHandler: (id: string, voiceHandler: VoiceHandler) => {
      update({ id, type: 'register', voiceHandler });

      return () => update({ id, type: 'unregister' });
    },
    setMuted: (muted: boolean) => update({ type: muted ? 'mute' : 'unmute' }),
    setVoiceState,
    startVoice: () => update({ type: 'start' }),
    stopVoice: () => update({ type: 'stop' }),
    voiceHandlers: select<ReadonlyMap<string, VoiceHandler>>(({ voiceHandlers }) => voiceHandlers),
    voiceState: select(({ voiceState }) => voiceState)
  });
}

export type { VoiceService };
