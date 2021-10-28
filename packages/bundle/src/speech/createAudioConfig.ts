// TODO: [P2] #3976 We should export this to allow web developers to bring in their own microphone.
//       For example, it should enable React Native devs to bring in their microphone implementation and use Cognitive Services Speech Services.

import { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk';

import CustomAudioInputStream, { AudioStreamNode, DeviceInfo, Format } from './CustomAudioInputStream';

type AttachFunction = (audioNodeId: string) => Promise<{
  audioStreamNode: AudioStreamNode;
  deviceInfo: DeviceInfo;
  format: Format;
}>;

type TurnOffFunction = () => Promise<void>;

const SYMBOL_ATTACH = Symbol('attach');
const SYMBOL_TURN_OFF = Symbol('turnOff');

type CreateAudioConfigOptions = {
  /** Callback function for attaching the device by returning an audio node. */
  attach: AttachFunction;

  /** `true` to enable diagnostic information, otherwise, `false`. */
  debug?: true;

  /**
   * Callback function for turning off the device before detaching its node from an audio graph.
   *
   * Note: this is not called for Direct Line Speech.
   */
  turnOff?: TurnOffFunction;
};

class CreateAudioConfigAudioInputStream extends CustomAudioInputStream {
  constructor({ attach, debug, turnOff }: CreateAudioConfigOptions) {
    if (!attach || typeof attach !== 'function') {
      throw new Error('"attach" must be a function.');
    }

    if (turnOff && typeof turnOff !== 'function') {
      throw new Error('"turnOff", if defined, must be a function.');
    }

    super({ debug });

    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    this[SYMBOL_ATTACH] = attach;

    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    this[SYMBOL_TURN_OFF] = turnOff;
  }

  [SYMBOL_ATTACH]: AttachFunction;
  [SYMBOL_TURN_OFF]: TurnOffFunction;

  protected performAttach(audioNodeId: string): Promise<{
    audioStreamNode: AudioStreamNode;
    deviceInfo: DeviceInfo;
    format: Format;
  }> {
    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    return this[SYMBOL_ATTACH](audioNodeId);
  }

  protected performTurnOff(): Promise<void> {
    const { [SYMBOL_TURN_OFF]: turnOff } = this;

    return turnOff && turnOff();
  }
}

export default function createAudioConfig(options: CreateAudioConfigOptions) {
  return AudioConfig.fromStreamInput(new CreateAudioConfigAudioInputStream(options));
}
