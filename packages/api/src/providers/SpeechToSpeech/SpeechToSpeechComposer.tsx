import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { isVoiceActivity, WebChatActivity } from 'botframework-webchat-core';
import { useAudioPlayer } from './private/useAudioPlayer';
import { useRecorder } from './private/useRecorder';
import { useDebouncedNotifications, usePostActivity, useVoiceActivities } from '../../hooks';
import SpeechToSpeechContext from './private/Context';
import { SpeechState } from './types/SpeechState';

export const SpeechToSpeechComposer: React.FC<{ readonly children: ReactNode }> = ({ children }) => {
  const [voiceActivities] = useVoiceActivities();
  const postActivity = usePostActivity();
  const [{ connectivitystatus }] = useDebouncedNotifications();
  const { playAudio, stopAudio, isPlaying } = useAudioPlayer();

  const lastProcessedIndexRef = useRef(0);

  // Remove when we have activity protocol changes, we would get this as part of signal activity.
  const [speechState, setSpeechState] = useState<SpeechState>('idle');

  const isConnected = useMemo(() => connectivitystatus?.message === 'connected', [connectivitystatus]);

  const sendAudioChunk = useCallback(
    (base64: string) => {
      postActivity({
        type: 'event',
        name: 'stream.chunk',
        value: { voiceLiveEvent: { type: 'input_audio_buffer.append', audio: base64 } }
      } as any);
    },
    [postActivity]
  );

  const { recording, setRecording: baseSetRecording } = useRecorder(sendAudioChunk);

  const cancelActiveResponse = useCallback(() => {
    if (isPlaying) {
      postActivity({
        type: 'event',
        value: { voiceLiveEvent: { type: 'response.cancel' } }
      } as any);
    }
  }, [isPlaying, postActivity]);

  const handleVoiceActivity = useCallback(
    (activity: WebChatActivity) => {
      if (!isVoiceActivity(activity)) {
        return;
      }

      const { voiceLiveEvent } = activity.value;

      switch (voiceLiveEvent.type) {
        case 'input_audio_buffer.speech_started':
          stopAudio();
          setSpeechState('listening');
          break;
        case 'input_audio_buffer.speech_stopped':
          setSpeechState('processing');
          break;
        case 'response.audio.delta':
          if (voiceLiveEvent.delta && recording) {
            playAudio(voiceLiveEvent.delta);
          }
          break;
        case 'response.done':
          if (!isPlaying) {
            setSpeechState('listening');
          }
          break;
        default:
          break;
      }
    },
    [isPlaying, playAudio, recording, stopAudio]
  );

  useEffect(() => {
    const startIndex = lastProcessedIndexRef.current;

    if (!voiceActivities.length || startIndex >= voiceActivities.length) {
      return;
    }

    // If not recording, skip processing voice activities but update ref
    // so next time we start recording, we only process new activities.
    if (!recording) {
      lastProcessedIndexRef.current = voiceActivities.length;
      return;
    }

    for (let i = startIndex; i < voiceActivities.length; i++) {
      // eslint-disable-next-line security/detect-object-injection
      handleVoiceActivity(voiceActivities[i]);
    }

    if (isPlaying && speechState !== 'bot_speaking') {
      setSpeechState('bot_speaking');
    } else if (!isPlaying && speechState === 'bot_speaking') {
      setSpeechState('listening');
    }

    lastProcessedIndexRef.current = voiceActivities.length;
  }, [voiceActivities, recording, postActivity, isPlaying, playAudio, speechState, stopAudio, handleVoiceActivity]);

  const setRecording = useCallback(
    (shouldRecord: boolean) => {
      if (!isConnected) {
        return;
      }

      if (!recording) {
        setSpeechState('listening');
      } else {
        stopAudio();
        cancelActiveResponse();
        setSpeechState('idle');
      }

      baseSetRecording(shouldRecord);
    },
    [isConnected, recording, baseSetRecording, stopAudio, cancelActiveResponse]
  );

  const contextValue = useMemo(
    () => ({
      recording,
      setRecording,
      speechState
    }),
    [recording, setRecording, speechState]
  );

  return <SpeechToSpeechContext.Provider value={contextValue}>{children}</SpeechToSpeechContext.Provider>;
};
