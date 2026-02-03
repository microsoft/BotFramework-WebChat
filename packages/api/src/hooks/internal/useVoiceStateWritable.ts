import { setVoiceState, type VoiceState } from 'botframework-webchat-core';
import { useCallback } from 'react';
import { useDispatch, useSelector } from './WebChatReduxContext';

/**
 * Internal hook to set the voice state.
 */
export default function useVoiceStateWritable(): readonly [VoiceState, (state: VoiceState) => void] {
  const dispatch = useDispatch();
  const setter = useCallback(
    (state: VoiceState) => {
      dispatch(setVoiceState(state));
    },
    [dispatch]
  );
  const value = useSelector(({ voice }) => voice.voiceState);
  return Object.freeze([value, setter]);
}
