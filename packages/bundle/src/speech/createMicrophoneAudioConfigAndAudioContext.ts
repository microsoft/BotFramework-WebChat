import { ChunkedArrayBufferStream } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Exports';
import { PcmRecorder } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.browser/Exports';

import { AudioStreamNode, DeviceInfo, Format } from './CustomAudioInputStream';
import bytesPerSample from './bytesPerSample';
import createAudioConfig from './createAudioConfig';
import createAudioContext from './createAudioContext';
import getUserMedia from './getUserMedia';

// This is how often we are flushing audio buffer to the network. Modify this value will affect latency.
const DEFAULT_BUFFER_DURATION_IN_MS = 100;

// TODO: [P2] #3975 We should consider building our own PcmRecorder:
//       - Use Audio Worklet via blob URL
//       - Not hardcoding the sample rate or other values
// PcmRecorder always downscale to 16000 Hz. We cannot use the dynamic value from MediaConstraints or MediaTrackSettings.
const PCM_RECORDER_HARDCODED_SETTINGS: MediaTrackSettings = Object.freeze({
  channelCount: 1,
  sampleRate: 16000,
  sampleSize: 16
});

const PCM_RECORDER_HARDCODED_FORMAT: Format = Object.freeze({
  bitsPerSample: PCM_RECORDER_HARDCODED_SETTINGS.sampleSize,
  // `channelCount` is not on @types/web@0.0.54 yet, related to https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1290.
  // @ts-ignore
  channels: PCM_RECORDER_HARDCODED_SETTINGS.channelCount,
  samplesPerSec: PCM_RECORDER_HARDCODED_SETTINGS.sampleRate
});

type MicrophoneAudioInputStreamOptions = {
  /** Specifies the constraints for selecting an audio device. */
  audioConstraints?: true | MediaTrackConstraints;

  /** Specifies the `AudioContext` to use. This object must be primed and ready to use. */
  audioContext: AudioContext;

  /** Specifies the buffering delay on how often to flush audio data to network. Increasing the value will increase audio latency. Default is 100 ms. */
  bufferDurationInMS?: number;

  /** Specifies whether to display diagnostic information. */
  debug?: true;

  /** Specifies if telemetry data should be sent. If not specified, telemetry data will NOT be sent. */
  enableTelemetry?: true;

  /** Specifies the `AudioWorklet` URL for `PcmRecorder`. If not specified, will use script processor on UI thread instead. */
  pcmRecorderWorkletUrl?: string;
};

function createMicrophoneAudioConfig(options: MicrophoneAudioInputStreamOptions) {
  const { audioConstraints, audioContext, debug, enableTelemetry, pcmRecorderWorkletUrl } = options;
  const bufferDurationInMS = options.bufferDurationInMS || DEFAULT_BUFFER_DURATION_IN_MS;

  const pcmRecorder = new PcmRecorder();

  pcmRecorderWorkletUrl && pcmRecorder.setWorkletUrl(pcmRecorderWorkletUrl);

  return createAudioConfig({
    async attach(audioNodeId: string): Promise<{
      audioStreamNode: AudioStreamNode;
      deviceInfo: DeviceInfo;
      format: Format;
    }> {
      // We need to get new MediaStream on every attach().
      // This is because PcmRecorder.releaseMediaResources() disconnected/stopped them.
      const mediaStream = await getUserMedia({ audio: audioConstraints, video: false });

      const [firstAudioTrack] = mediaStream.getAudioTracks();

      if (!firstAudioTrack) {
        throw new Error('No audio device is found.');
      }

      const outputStream = new ChunkedArrayBufferStream(
        // Speech SDK quirks: PcmRecorder hardcoded sample rate of 16000 Hz.
        bytesPerSample(PCM_RECORDER_HARDCODED_SETTINGS) *
          // eslint-disable-next-line no-magic-numbers
          ((bufferDurationInMS || DEFAULT_BUFFER_DURATION_IN_MS) / 1000),
        audioNodeId
      );

      pcmRecorder.record(audioContext, mediaStream, outputStream);

      return {
        audioStreamNode: {
          // Speech SDK quirks: In SDK's original MicAudioSource implementation, it call turnOff() during detach().
          //                    That means, it call turnOff(), then detach(), then turnOff() again. Seems redundant.
          //                    When using with Direct Line Speech, turnOff() is never called.
          detach: (): Promise<void> => {
            // Speech SDK quirks: In SDK, it call outputStream.close() in turnOff() before outputStream.readEnded() in detach().
            //                    I think it make sense to call readEnded() before close().
            outputStream.readEnded();
            outputStream.close();

            // PcmRecorder.releaseMediaResources() will disconnect/stop the MediaStream.
            // We cannot use MediaStream again after turned off.
            pcmRecorder.releaseMediaResources(audioContext);

            // MediaStream will become inactive after all tracks are removed.
            mediaStream.getTracks().forEach(track => mediaStream.removeTrack(track));

            // ESLint: "return" is required by TypeScript
            // eslint-disable-next-line no-useless-return
            return;
          },
          id: () => audioNodeId,
          read: () => outputStream.read()
        },
        deviceInfo: {
          manufacturer: 'Bot Framework Web Chat',
          model: enableTelemetry ? firstAudioTrack.label : '',
          type: enableTelemetry ? 'Microphones' : 'Unknown'
        },
        // Speech SDK quirks: PcmRecorder hardcoded sample rate of 16000 Hz.
        //                    We cannot obtain this number other than looking at their source code.
        //                    I.e. no getter property.
        // PcmRecorder always downscale to 16000 Hz. We cannot use the dynamic value from MediaConstraints or MediaTrackSettings.
        format: PCM_RECORDER_HARDCODED_FORMAT
      };
    },
    debug
  });
}

export default function createMicrophoneAudioConfigAndAudioContext({
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
    audioConfig: createMicrophoneAudioConfig({
      audioConstraints: audioInputDeviceId ? { deviceId: audioInputDeviceId } : true,
      audioContext,
      enableTelemetry: enableTelemetry ? true : undefined
    }),
    audioContext
  };
}
