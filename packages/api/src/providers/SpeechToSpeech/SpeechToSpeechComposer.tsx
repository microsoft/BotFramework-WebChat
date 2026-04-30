import React, { type ReactNode } from 'react';
import { VoiceProcessingSoundBridge } from './private/VoiceProcessingSoundBridge';
import { VoiceHandlerBridge } from './private/VoiceHandlerBridge';
import { VoiceRecorderBridge } from './private/VoiceRecorderBridge';

/**
 * SpeechToSpeechComposer sets up the speech-to-speech infrastructure.
 *
 * This component renders invisible bridge components that:
 * 1. VoiceHandlerBridge - registers audio player functions with Redux
 * 2. VoiceRecorderBridge - reacts to recording state and manages microphone
 * 3. VoiceProcessingSoundBridge - plays processing audio cue while voiceState is 'processing'
 *
 * Use the `useVoiceState`, `useStartVoice`, and `useStopVoice` hooks to access state and controls.
 */
export const SpeechToSpeechComposer: React.FC<{ readonly children: ReactNode }> = ({ children }) => (
  <React.Fragment>
    <VoiceHandlerBridge />
    <VoiceRecorderBridge />
    <VoiceProcessingSoundBridge />
    {children}
  </React.Fragment>
);
