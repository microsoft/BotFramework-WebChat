import { ChunkedArrayBufferStream } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Exports';
import { PcmRecorder } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.browser/Exports';

import bytesPerSample from './bytesPerSample';
import CustomAudioInputStream, { AudioStreamNode, DeviceInfo, Format } from './CustomAudioInputStream';
import getUserMedia from './getUserMedia';

// This is how often we are flushing audio buffer to the network. Modify this value will affect latency.
const DEFAULT_BUFFER_DURATION_IN_MS = 100;

// PcmRecorder always downscale to 16000 Hz. We cannot use the dynamic value from MediaConstraints or MediaTrackSettings.
const PCM_RECORDER_HARDCODED_SETTINGS: MediaTrackSettings = Object.freeze({
  channelCount: 1,
  sampleRate: 16000,
  sampleSize: 16
});

const PCM_RECORDER_HARDCODED_FORMAT: Format = Object.freeze({
  bitsPerSample: PCM_RECORDER_HARDCODED_SETTINGS.sampleSize,
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

  /** Specifies if telemetry data should be sent. If not specified, telemetry data will NOT be sent. */
  enableTelemetry?: true;

  /** Specifies the `AudioWorklet` URL for `PcmRecorder`. If not specified, will use script processor on UI thread instead. */
  pcmRecorderWorkletUrl?: string;
};

const SYMBOL_AUDIO_CONSTRAINTS = Symbol('audioConstraints');
const SYMBOL_AUDIO_CONTEXT = Symbol('audioContext');
const SYMBOL_BUFFER_DURATION_IN_MS = Symbol('bufferDurationInMS');
const SYMBOL_ENABLE_TELEMETRY = Symbol('enableTelemetry');
const SYMBOL_OUTPUT_STREAM = Symbol('outputStream');
const SYMBOL_PCM_RECORDER = Symbol('pcmRecorder');

export default class MicrophoneAudioInputStream extends CustomAudioInputStream {
  constructor(options: MicrophoneAudioInputStreamOptions) {
    super({ debug: true });

    const { audioConstraints, audioContext, bufferDurationInMS, pcmRecorderWorkletUrl } = options;

    this[SYMBOL_AUDIO_CONSTRAINTS] = audioConstraints === 'boolean' || audioConstraints;
    this[SYMBOL_AUDIO_CONTEXT] = audioContext;
    this[SYMBOL_BUFFER_DURATION_IN_MS] = bufferDurationInMS || DEFAULT_BUFFER_DURATION_IN_MS;

    const pcmRecorder = (this[SYMBOL_PCM_RECORDER] = new PcmRecorder());

    pcmRecorderWorkletUrl && pcmRecorder.setWorkletUrl(pcmRecorderWorkletUrl);
  }

  [SYMBOL_AUDIO_CONSTRAINTS]: true | MediaTrackConstraints;
  [SYMBOL_AUDIO_CONTEXT]: AudioContext;
  [SYMBOL_BUFFER_DURATION_IN_MS]: number;
  [SYMBOL_ENABLE_TELEMETRY]?: true;
  [SYMBOL_OUTPUT_STREAM]?: ChunkedArrayBufferStream;
  [SYMBOL_PCM_RECORDER]?: PcmRecorder;

  async performAttach(
    audioNodeId: string
  ): Promise<{
    audioStreamNode: AudioStreamNode;
    deviceInfo: DeviceInfo;
    format: Format;
  }> {
    const {
      [SYMBOL_AUDIO_CONTEXT]: audioContext,
      [SYMBOL_BUFFER_DURATION_IN_MS]: bufferDurationInMS,
      [SYMBOL_PCM_RECORDER]: pcmRecorder
    } = this;

    // We need to get new MediaStream on every attach().
    // This is because PcmRecorder.releaseMediaResources() disconnected/stopped them.
    const mediaStream = await getUserMedia({ audio: this[SYMBOL_AUDIO_CONSTRAINTS], video: false });

    const [firstAudioTrack] = mediaStream.getAudioTracks();

    if (!firstAudioTrack) {
      throw new Error('No audio device is found.');
    }

    const outputStream = (this[SYMBOL_OUTPUT_STREAM] = new ChunkedArrayBufferStream(
      // Speech SDK quirks: PcmRecorder hardcoded sample rate of 16000 Hz.
      // eslint-disable-next-line no-magic-numbers
      bytesPerSample(PCM_RECORDER_HARDCODED_SETTINGS) * ((bufferDurationInMS || DEFAULT_BUFFER_DURATION_IN_MS) / 1000),
      audioNodeId
    ));

    pcmRecorder.record(audioContext, mediaStream, outputStream);

    return {
      audioStreamNode: {
        // Speech SDK quirks: In SDK's original MicAudioSource implementation, it call turnOff() during detach().
        //                    That means, it call turnOff(), then detach(), then turnOff() again. Seems redundant.
        //                    When using with Direct Line Speech, turnOff() is never called.
        detach: (): Promise<void> => {
          // Speech SDK quirks: In SDK, it call outputStream.close() in turnOff() before outputStream.readEnded() in detach().
          //                    I think it make sense to call readEnded() before close().
          this[SYMBOL_OUTPUT_STREAM].readEnded();
          this[SYMBOL_OUTPUT_STREAM].close();

          // PcmRecorder.releaseMediaResources() will disconnect/stop the MediaStream.
          // We cannot use MediaStream again after turned off.
          this[SYMBOL_PCM_RECORDER].releaseMediaResources(this[SYMBOL_AUDIO_CONTEXT]);

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
        model: this[SYMBOL_ENABLE_TELEMETRY] ? firstAudioTrack.label : '',
        type: this[SYMBOL_ENABLE_TELEMETRY] ? 'Microphones' : 'Unknown'
      },
      // Speech SDK quirks: PcmRecorder hardcoded sample rate of 16000 Hz.
      //                    We cannot obtain this number other than looking at their source code.
      //                    I.e. no getter property.
      // PcmRecorder always downscale to 16000 Hz. We cannot use the dynamic value from MediaConstraints or MediaTrackSettings.
      format: PCM_RECORDER_HARDCODED_FORMAT
    };
  }
}
