// TODO: [P2] #XXX We should export this to allow web developers to bring in their own microphone.
//       For example, it should enable React Native devs to bring in their microphone implementation and use Cognitive Services Speech Services.

import { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk';

import CustomAudioInputStream, { AudioStreamNode, DeviceInfo, Format } from './CustomAudioInputStream';

type AttachFunction = (
  audioNodeId: string
) => Promise<{
  audioStreamNode: AudioStreamNode;
  deviceInfo: DeviceInfo;
  format: Format;
}>;

type TurnOffFunction = () => Promise<void>;

const SYMBOL_ATTACH = Symbol('attach');
const SYMBOL_TURN_OFF = Symbol('turnOff');

type CreateAudioConfigOptions = {
  attach: AttachFunction;
  debug?: true;
  turnOff?: TurnOffFunction;
};

class CreateAudioConfigAudioInputStream extends CustomAudioInputStream {
  constructor({ attach, debug, turnOff }: CreateAudioConfigOptions) {
    super({ debug });

    this[SYMBOL_ATTACH] = attach;
    this[SYMBOL_TURN_OFF] = turnOff;
  }

  [SYMBOL_ATTACH]: AttachFunction;
  [SYMBOL_TURN_OFF]: TurnOffFunction;

  protected performAttach(
    audioNodeId: string
  ): Promise<{
    audioStreamNode: AudioStreamNode;
    deviceInfo: DeviceInfo;
    format: Format;
  }> {
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
