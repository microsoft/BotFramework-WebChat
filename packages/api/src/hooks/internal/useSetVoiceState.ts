import { setVoiceState, type VoiceState } from 'botframework-webchat-core';
import { useCallback } from 'react';
import { useDispatch } from './WebChatReduxContext';

/**
 * Internal hook to set the voice state.
 */
export default function useSetVoiceState(): (state: VoiceState) => void {
  const dispatch = useDispatch();

  return useCallback(
    (state: VoiceState) => {
      dispatch(setVoiceState(state));
    },
    [dispatch]
  );
}
