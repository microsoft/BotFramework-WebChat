import React, { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { isVoiceActivity, WebChatActivity } from 'botframework-webchat-core';
import { useAudioPlayer } from './private/useAudioPlayer';
import { useRecorder } from './private/useRecorder';
import { useDebouncedNotifications, usePostActivity, useVoiceActivities } from '../../hooks';
import SpeechToSpeechContext from './private/Context';
import { SpeechState } from './types/SpeechState';
import useStateRef from '../../hooks/internal/useStateRef';

export const SpeechToSpeechComposer: React.FC<{ readonly children: ReactNode }> = ({ children }) => {
  const [voiceActivities] = useVoiceActivities();
  const postActivity = usePostActivity();
  const [{ connectivitystatus }] = useDebouncedNotifications();
  const lastProcessedIndexRef = useRef(0);
  const [speechState, setSpeechState] = useStateRef<SpeechState>('idle');

  // config received from server on session init (only once), for now ccv2 and mmrt runs on different sample rate and chunk interval.
  // we will read those config, free form object as unsure of what all session config would be needed in future.
  const [serverConfig, setServerConfig] = useStateRef<Record<string, unknown> | null>(null);
  const { playAudio, stopAudio, isPlaying } = useAudioPlayer(serverConfig);

  const isConnected = useMemo(() => connectivitystatus?.message === 'connected', [connectivitystatus]);

  const sendAudioChunk = useCallback(
    (base64: string, timestamp: string) => {
      postActivity({
        type: 'event',
        name: 'stream.chunk',
        value: { voice: { contentUrl: base64, timestamp } }
      } as any);
    },
    [postActivity]
  );

  const { recording, setRecording: baseSetRecording } = useRecorder(sendAudioChunk, serverConfig);

  const handleVoiceActivity = useCallback(
    (activity: WebChatActivity) => {
      if (!isVoiceActivity(activity)) {
        return;
      }

      const { name, value } = activity;
      const { voice } = value;

      switch (name) {
        // TODO - this will be commandResult activity and not event, need to think on handling of command and commandResult activities.
        case 'session.init': {
          setServerConfig(value.session?.config as Record<string, unknown>);
          break;
        }

        case 'session.update': {
          switch (voice.bot_state) {
            case 'voice.request.detected':
              stopAudio();
              setSpeechState('user_speaking');
              break;

            case 'voice.request.processing':
              setSpeechState('processing');
              break;

            default:
              break;
          }
          break;
        }

        case 'stream.chunk': {
          if (voice.contentUrl) {
            playAudio(voice.contentUrl);
          }
          break;
        }

        default:
          break;
      }
    },
    [playAudio, setServerConfig, setSpeechState, stopAudio]
  );

  useEffect(() => {
    const startIndex = lastProcessedIndexRef.current;
    if (!voiceActivities.length || startIndex >= voiceActivities.length) {
      return;
    }

    for (let i = startIndex; i < voiceActivities.length; i++) {
      // eslint-disable-next-line security/detect-object-injection
      const activity = voiceActivities[i];

      // Skip processing the activity if it's from the user as we want to process only incoming voice activities.
      // we may receive (optional) config from server as soon as socket is established
      // at that time recording would be off but we still want to process to read config and act on it.
      if (
        activity.from?.role === 'user' ||
        (!recording && isVoiceActivity(activity) && activity.name !== 'session.init')
      ) {
        continue;
      }

      handleVoiceActivity(activity);
    }

    if (isPlaying && speechState !== 'bot_speaking') {
      setSpeechState('bot_speaking');
    } else if (!isPlaying && speechState === 'bot_speaking') {
      setSpeechState('listening');
    }

    lastProcessedIndexRef.current = voiceActivities.length;
  }, [handleVoiceActivity, isPlaying, recording, setSpeechState, speechState, voiceActivities]);

  const setRecording = useCallback(
    async (shouldRecord: boolean) => {
      if (!isConnected) {
        return;
      }

      if (shouldRecord) {
        setSpeechState('listening');
      } else {
        stopAudio();
        setSpeechState('idle');
      }

      await baseSetRecording(shouldRecord);
    },
    [isConnected, baseSetRecording, setSpeechState, stopAudio]
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
