import { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk';

import createAudioContext from './createAudioContext';
import MicrophoneAudioInputStream from './MicrophoneAudioInputStream';

export default function createMicrophoneAudioConfig({
  audioContext,
  audioInputDeviceId,
  enableTelemetry
}: {
  audioContext?: AudioContext;
  audioInputDeviceId?: string;
  enableTelemetry?: true;
}) {
  // Web Chat has an implementation of AudioConfig for microphone that would enable better support on Safari:
  // - Maintain same instance of `AudioContext` across recognitions;
  // - Resume suspended `AudioContext` on user gestures.
  audioContext || (audioContext = createAudioContext());

  return {
    audioConfig: AudioConfig.fromStreamInput(
      new MicrophoneAudioInputStream({
        audioConstraints: audioInputDeviceId ? { deviceId: audioInputDeviceId } : true,
        audioContext,
        enableTelemetry: enableTelemetry ? true : undefined
      })
    ),
    audioContext
  };
}
