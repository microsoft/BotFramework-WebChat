import { AudioInputStream } from 'microsoft-cognitiveservices-speech-sdk';

import {
  AudioSourceErrorEvent,
  AudioSourceEvent,
  AudioSourceInitializingEvent,
  AudioSourceOffEvent,
  AudioSourceReadyEvent,
  AudioStreamNodeAttachedEvent,
  AudioStreamNodeAttachingEvent,
  AudioStreamNodeDetachedEvent,
  AudioStreamNodeErrorEvent,
  Events,
  EventSource
} from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/Exports';

import { AudioStreamFormatImpl } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Audio/AudioStreamFormat';

import {
  connectivity as Connectivity,
  ISpeechConfigAudioDevice,
  type as Type
} from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/Exports';

import { v4 } from 'uuid';
import createDeferred, { DeferredPromise } from 'p-defer';

type AudioStreamNode = {
  detach: () => Promise<void>;
  id: () => string;
  read: () => Promise<StreamChunk<ArrayBuffer>>;
};

type DeviceInfo = {
  connectivity?: Connectivity | 'Bluetooth' | 'Wired' | 'WiFi' | 'Cellular' | 'InBuilt' | 'Unknown';
  manufacturer?: string;
  model?: string;
  type?:
    | Type
    | 'Phone'
    | 'Speaker'
    | 'Car'
    | 'Headset'
    | 'Thermostat'
    | 'Microphones'
    | 'Deskphone'
    | 'RemoteControl'
    | 'Unknown'
    | 'File'
    | 'Stream';
};

type Format = {
  bitsPerSample: number;
  channels: number;
  samplesPerSec: number;
};

type NormalizedOptions = Required<Omit<Options, 'debug'>> & {
  debug: boolean;
};

type Options = {
  debug?: true;
  id?: string;
};

type StreamChunk<T> = {
  isEnd: boolean;
  buffer: T;
  timeReceived: number;
};

const SYMBOL_DEVICE_INFO_DEFERRED = Symbol('deviceInfoDeferred');
const SYMBOL_EVENTS = Symbol('events');
const SYMBOL_FORMAT_DEFERRED = Symbol('formatDeferred');
const SYMBOL_OPTIONS = Symbol('options');

// Speech SDK quirks: Only 2 lifecycle functions are actually used.
//                    They are: attach() and turnOff().
//                    Others are not used, including: blob(), close(), detach(), turnOn().
abstract class CustomAudioInputStream extends AudioInputStream {
  constructor(options: Options = {}) {
    super();

    const normalizedOptions: NormalizedOptions = {
      debug: options.debug || false,
      id: options.id || v4().replace(/-/gu, '')
    };

    this[SYMBOL_DEVICE_INFO_DEFERRED] = createDeferred<DeviceInfo>();
    this[SYMBOL_EVENTS] = new EventSource<AudioSourceEvent>();
    this[SYMBOL_OPTIONS] = normalizedOptions;
    this[SYMBOL_FORMAT_DEFERRED] = createDeferred<AudioStreamFormatImpl>();
  }

  [SYMBOL_DEVICE_INFO_DEFERRED]: DeferredPromise<DeviceInfo>;
  [SYMBOL_EVENTS]: EventSource<AudioSourceEvent>;
  [SYMBOL_FORMAT_DEFERRED]: DeferredPromise<AudioStreamFormatImpl>;
  [SYMBOL_OPTIONS]: NormalizedOptions;

  // ESLint: This code will only works in browsers other than IE11. Only works in ES5 is okay.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Accessors are only available when targeting ECMAScript 5 and higher.ts(1056)
  get events(): EventSource<AudioSourceEvent> {
    return this[SYMBOL_EVENTS];
  }

  // Speech SDK quirks: AudioStreamFormatImpl is internal implementation while AudioStreamFormat is public.
  //                    It is weird to expose AudioStreamFormatImpl instead of AudioStreamFormat.
  // Speech SDK quirks: It is weird to return a Promise in a property.
  //                    Especially this is audio format. Setup options should be initialized synchronously.
  // Speech SDK quirks: In normal speech recognition, getter of "format" is called only after "attach".
  //                    But in Direct Line Speech, it is called before "attach".
  // ESLint: This code will only works in browsers other than IE11. Only works in ES5 is okay.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Accessors are only available when targeting ECMAScript 5 and higher.ts(1056)
  get format(): Promise<AudioStreamFormatImpl> {
    this.debug('Getting "format".');

    return this[SYMBOL_FORMAT_DEFERRED].promise;
  }

  id(): string {
    return this[SYMBOL_OPTIONS].id;
  }

  // Speech SDK quirks: In JavaScript, onXxx means "listen to event XXX".
  //                    Instead, in Speech SDK, it means "emit event XXX".
  protected onEvent(event: AudioSourceEvent): void {
    this[SYMBOL_EVENTS].onEvent(event);
    Events.instance.onEvent(event);
  }

  protected emitInitializing(): void {
    this.debug('Emitting "AudioSourceInitializingEvent".');
    this.onEvent(new AudioSourceInitializingEvent(this.id()));
  }

  protected emitReady(): void {
    this.debug('Emitting "AudioSourceReadyEvent".');
    this.onEvent(new AudioSourceReadyEvent(this.id()));
  }

  // Speech SDK quirks: Since "turnOn" is never called and "turnOff" does not work in Direct Line Speech, the "source error" event is not emitted at all.
  //                    Instead, we only emit "node error" event.
  protected emitError(error: Error): void {
    this.debug('Emitting "AudioSourceErrorEvent".', { error });

    // Speech SDK quirks: "error" is a string, instead of object of type "Error".
    this.onEvent(new AudioSourceErrorEvent(this.id(), error.message));
  }

  protected emitNodeAttaching(audioNodeId: string): void {
    this.debug(`Emitting "AudioStreamNodeAttachingEvent" for node "${audioNodeId}".`);
    this.onEvent(new AudioStreamNodeAttachingEvent(this.id(), audioNodeId));
  }

  protected emitNodeAttached(audioNodeId: string): void {
    this.debug(`Emitting "AudioStreamNodeAttachedEvent" for node "${audioNodeId}".`);
    this.onEvent(new AudioStreamNodeAttachedEvent(this.id(), audioNodeId));
  }

  protected emitNodeError(audioNodeId: string, error: Error): void {
    this.debug(`Emitting "AudioStreamNodeErrorEvent" for node "${audioNodeId}".`, { error });

    // Speech SDK quirks: "error" is a string, instead of object of type "Error".
    this.onEvent(new AudioStreamNodeErrorEvent(this.id(), audioNodeId, error.message));
  }

  protected emitNodeDetached(audioNodeId: string): void {
    this.debug('Emitting "AudioStreamNodeDetachedEvent".');
    this.onEvent(new AudioStreamNodeDetachedEvent(this.id(), audioNodeId));
  }

  protected emitOff(): void {
    this.debug('Emitting "AudioSourceOffEvent".');
    this.onEvent(new AudioSourceOffEvent(this.id()));
  }

  // Speech SDK quirks: Although "close" is marked as abstract, it is never called in our observations.

  // ESLint: Speech SDK requires this function, but we are not implementing it.
  // eslint-disable-next-line class-methods-use-this
  close(): void {
    this.debug('Callback for "close".');

    throw new Error('Not implemented');
  }

  // Speech SDK quirks: Although "turnOn" is implemented in XxxAudioInputStream, it is never called in our observations.
  turnOn(): void {
    this.debug('Callback for "turnOn".');

    throw new Error('Not implemented');
  }

  // Speech SDK quirks: Although "detach" is implemented in XxxAudioInputStream, it is never called in our observations.
  detach(): void {
    this.debug('Callback for "detach".');

    throw new Error('Not implemented');
  }

  private debug(message, ...args) {
    // ESLint: For debugging, will only log when "debug" is set to "true".
    // eslint-disable-next-line no-console
    this[SYMBOL_OPTIONS].debug && console.info(`CustomAudioInputStream: ${message}`, ...args);
  }

  /** Implements this function. When called, it should start recording and return an `IAudioStreamNode`. */
  protected abstract performAttach(
    audioNodeId: string
  ): Promise<{
    audioStreamNode: AudioStreamNode;
    deviceInfo: DeviceInfo;
    format: Format;
  }>;

  attach(audioNodeId: string): Promise<AudioStreamNode> {
    this.debug(`Callback for "attach" with "${audioNodeId}".`);

    this.emitNodeAttaching(audioNodeId);

    return Promise.resolve().then<AudioStreamNode>(async () => {
      this.emitInitializing();

      try {
        const { audioStreamNode, deviceInfo, format } = await this.performAttach(audioNodeId);

        // Although only getter of "format" is called before "attach" (in Direct Line Speech),
        // we are handling both "deviceInfo" and "format" in similar way for uniformity.
        this[SYMBOL_DEVICE_INFO_DEFERRED].resolve(deviceInfo);
        this[SYMBOL_FORMAT_DEFERRED].resolve(
          new AudioStreamFormatImpl(format.samplesPerSec, format.bitsPerSample, format.channels)
        );

        this.emitReady();
        this.emitNodeAttached(audioNodeId);

        return {
          detach: async () => {
            this.debug(`Detaching audio node "${audioNodeId}".`);

            await audioStreamNode.detach();

            // Speech SDK quirks: Since "turnOff" is not called in Direct Line Speech, we will emit event "source off" here instead.
            this.emitOff();
            this.emitNodeDetached(audioNodeId);
          },
          id: () => audioStreamNode.id(),
          read: () => {
            this.debug('Reading');

            return audioStreamNode.read();
          }
        };
      } catch (error) {
        this.emitNodeError(audioNodeId, error);

        throw error;
      }
    });
  }

  /**
   * Implements this function. When called, it should stop recording. This is called before the `IAudioStreamNode.detach` function.
   *
   * Note: when using with Direct Line Speech, this function is never called.
   */

  // ESLint: We are not implementing this function because it is not called by Direct Line Speech.
  // eslint-disable-next-line class-methods-use-this
  protected performTurnOff(): Promise<void> {
    // ESLint: "return" is required by TypeScript
    // eslint-disable-next-line no-useless-return
    return;
  }

  // Speech SDK quirks: It is confused to have both "turnOff" and "detach". "turnOff" is called before "detach".
  //                    Why don't we put all logics at "detach"?
  // Speech SDK quirks: Direct Line Speech never call "turnOff". "Source off" event need to be emitted during "detach" instead.
  //                    Also, custom implementation should be done at "detach" instead, such as ending and closing output streams.
  async turnOff(): Promise<void> {
    this.debug(`Callback for "turnOff".`);

    await this.performTurnOff();
  }

  // ESLint: This code will only works in browsers other than IE11. Only works in ES5 is okay.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Accessors are only available when targeting ECMAScript 5 and higher.ts(1056)
  get deviceInfo(): Promise<ISpeechConfigAudioDevice> {
    this.debug(`Getting "deviceInfo".`);

    return Promise.all([this[SYMBOL_DEVICE_INFO_DEFERRED].promise, this[SYMBOL_FORMAT_DEFERRED].promise]).then(
      ([{ connectivity, manufacturer, model, type }, { bitsPerSample, channels, samplesPerSec }]) => ({
        bitspersample: bitsPerSample,
        channelcount: channels,
        connectivity:
          typeof connectivity === 'string' ? Connectivity[connectivity] : connectivity || Connectivity.Unknown,
        manufacturer: manufacturer || '',
        model: model || '',
        samplerate: samplesPerSec,
        type: typeof type === 'string' ? Type[type] : type || Type.Unknown
      })
    );
  }
}

export default CustomAudioInputStream;

export type { AudioStreamNode, DeviceInfo, Format, Options };
