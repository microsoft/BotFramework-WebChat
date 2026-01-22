import React, { type ReactNode } from 'react';
import { VoiceHandlerBridge } from './private/VoiceHandlerBridge';
import { VoiceRecorderBridge } from './private/VoiceRecorderBridge';

/**
 * SpeechToSpeechComposer sets up the speech-to-speech infrastructure.
 *
 * This component renders invisible bridge components that:
 * 1. VoiceHandlerBridge - registers audio player functions with Redux
 * 2. VoiceRecorderBridge - reacts to recording state and manages microphone
 *
 * Use the `useSpeechToSpeech` hook to access state and controls.
 */
export const SpeechToSpeechComposer: React.FC<{ readonly children: ReactNode }> = ({ children }) => (
  <React.Fragment>
    <VoiceHandlerBridge />
    <VoiceRecorderBridge />
    {children}
  </React.Fragment>
);
