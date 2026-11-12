import { type VoiceHandler, type VoiceState } from 'botframework-webchat-core';
import React, { memo, type ReactNode } from 'react';

import createSliceContext from './private/createSliceContext';

const [MicrophoneMutedContext, useMicrophoneMutedSlice] = createSliceContext<boolean>('WebChatMicrophoneMutedContext');

const [VoiceHandlersContext, useVoiceHandlersSlice] =
  createSliceContext<ReadonlyMap<string, VoiceHandler>>('WebChatVoiceHandlersContext');

const [VoiceStateContext, useVoiceStateSlice] = createSliceContext<VoiceState>('WebChatVoiceStateContext');

type VoiceSlicesProps = {
  readonly children?: ReactNode | undefined;
  readonly microphoneMuted: boolean;
  readonly voiceHandlers: ReadonlyMap<string, VoiceHandler>;
  readonly voiceState: VoiceState;
};

/**
 * The voice group (the `voice` slice of the Redux store) as 3 slices: microphone muted, voice handlers and voice state,
 * one context each, so registering a voice handler does not re-render the readers of mute or state. Both provider sets
 * render it, with the values of their state.
 */
function VoiceSlicesProvider({ children, microphoneMuted, voiceHandlers, voiceState }: VoiceSlicesProps) {
  return (
    <MicrophoneMutedContext.Provider value={microphoneMuted}>
      <VoiceHandlersContext.Provider value={voiceHandlers}>
        <VoiceStateContext.Provider value={voiceState}>{children}</VoiceStateContext.Provider>
      </VoiceHandlersContext.Provider>
    </MicrophoneMutedContext.Provider>
  );
}

VoiceSlicesProvider.displayName = 'VoiceSlicesProvider';

// Memoized: it is the innermost slices, its children keep their identity, so it skips a render when no voice slice changed.
const VoiceSlices = memo(VoiceSlicesProvider);

export default VoiceSlices;
export { useMicrophoneMutedSlice, useVoiceHandlersSlice, useVoiceStateSlice, type VoiceSlicesProps };
