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

import { isForbiddenPropertyName } from 'botframework-webchat-core';
import { v4 } from 'uuid';
import createDeferred, { DeferredPromise } from 'p-defer-es5';

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

    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    this[SYMBOL_DEVICE_INFO_DEFERRED] = createDeferred<DeviceInfo>();

    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    this[SYMBOL_EVENTS] = new EventSource<AudioSourceEvent>();

    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    this[SYMBOL_FORMAT_DEFERRED] = createDeferred<AudioStreamFormatImpl>();

    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    this[SYMBOL_OPTIONS] = normalizedOptions;
  }

  [SYMBOL_DEVICE_INFO_DEFERRED]: DeferredPromise<DeviceInfo>;
  [SYMBOL_EVENTS]: EventSource<AudioSourceEvent>;
  [SYMBOL_FORMAT_DEFERRED]: DeferredPromise<AudioStreamFormatImpl>;
  [SYMBOL_OPTIONS]: NormalizedOptions;

  /** Gets the event source for listening to events. */
  // ESLint: This code will only works in browsers other than IE11. Only works in ES5 is okay.
  // @ts-ignore Accessors are only available when targeting ECMAScript 5 and higher.ts(1056)
  get events(): EventSource<AudioSourceEvent> {
    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    return this[SYMBOL_EVENTS];
  }

  /** Gets the format of the audio stream. */
  // Speech SDK quirks: `AudioStreamFormatImpl` is internal implementation while `AudioStreamFormat` is public.
  //                    It is weird to expose `AudioStreamFormatImpl` instead of `AudioStreamFormat`.
  // Speech SDK quirks: It is weird to return a `Promise` in a property.
  // Speech SDK quirks: In normal speech recognition, getter of "format" is called only after "attach".
  //                    But in Direct Line Speech, it is called before "attach".
  // ESLint: This code will only works in browsers other than IE11. Only works in ES5 is okay.
  // @ts-ignore Accessors are only available when targeting ECMAScript 5 and higher.ts(1056)
  get format(): Promise<AudioStreamFormatImpl> {
    this.debug('Getting "format".');

    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    return this[SYMBOL_FORMAT_DEFERRED].promise;
  }

  /** Gets the ID of this audio stream. */
  id(): string {
    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    return this[SYMBOL_OPTIONS].id;
  }

  /** Emits an event. */
  // Speech SDK quirks: In JavaScript, onXxx means "listen to event XXX".
  //                    Instead, in Speech SDK, it means "emit event XXX".
  protected onEvent(event: AudioSourceEvent): void {
    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    this[SYMBOL_EVENTS].onEvent(event);
    Events.instance.onEvent(event);
  }

  /** Emits an `AudioSourceInitializingEvent`. */
  protected emitInitializing(): void {
    this.debug('Emitting "AudioSourceInitializingEvent".');
    this.onEvent(new AudioSourceInitializingEvent(this.id()));
  }

  /** Emits an `AudioSourceReadyEvent`. */
  protected emitReady(): void {
    this.debug('Emitting "AudioSourceReadyEvent".');
    this.onEvent(new AudioSourceReadyEvent(this.id()));
  }

  /** Emits an `AudioSourceErrorEvent`. */
  // Speech SDK quirks: Since "turnOn" is never called and "turnOff" does not work in Direct Line Speech, the "source error" event is not emitted at all.
  //                    Instead, we only emit "node error" event.
  protected emitError(error: Error): void {
    this.debug('Emitting "AudioSourceErrorEvent".', { error });

    // Speech SDK quirks: "error" is a string, instead of object of type "Error".
    this.onEvent(new AudioSourceErrorEvent(this.id(), error.message));
  }

  /** Emits an `AudioStreamNodeAttachingEvent`. */
  protected emitNodeAttaching(audioNodeId: string): void {
    this.debug(`Emitting "AudioStreamNodeAttachingEvent" for node "${audioNodeId}".`);
    this.onEvent(new AudioStreamNodeAttachingEvent(this.id(), audioNodeId));
  }

  /** Emits an `AudioStreamNodeAttachedEvent`. */
  protected emitNodeAttached(audioNodeId: string): void {
    this.debug(`Emitting "AudioStreamNodeAttachedEvent" for node "${audioNodeId}".`);
    this.onEvent(new AudioStreamNodeAttachedEvent(this.id(), audioNodeId));
  }

  /** Emits an `AudioStreamNodeErrorEvent`. */
  protected emitNodeError(audioNodeId: string, error: Error): void {
    this.debug(`Emitting "AudioStreamNodeErrorEvent" for node "${audioNodeId}".`, { error });

    // Speech SDK quirks: "error" is a string, instead of object of type "Error".
    this.onEvent(new AudioStreamNodeErrorEvent(this.id(), audioNodeId, error.message));
  }

  /** Emits an `AudioStreamNodeDetachedEvent`. */
  protected emitNodeDetached(audioNodeId: string): void {
    this.debug('Emitting "AudioStreamNodeDetachedEvent".');
    this.onEvent(new AudioStreamNodeDetachedEvent(this.id(), audioNodeId));
  }

  /** Emits an `AudioSourceOffEvent`. */
  protected emitOff(): void {
    this.debug('Emitting "AudioSourceOffEvent".');
    this.onEvent(new AudioSourceOffEvent(this.id()));
  }

  // Speech SDK quirks: Although "close" is marked as abstract, it is never called in our observations.
  // ESLint: Speech SDK requires this function, but we are not implementing it.
  close(): void {
    this.debug('Callback for "close".');

    throw new Error('Not implemented');
  }

  // Speech SDK quirks: Although "turnOn" is implemented in Speech SDK Push/PullAudioInputStream, it is never called in our observations.
  turnOn(): void {
    this.debug('Callback for "turnOn".');

    throw new Error('Not implemented');
  }

  // Speech SDK quirks: Although "detach" is implemented in Speech SDK Push/PullAudioInputStream, it is never called in our observations.
  detach(): void {
    this.debug('Callback for "detach".');

    throw new Error('Not implemented');
  }

  /** Log the message to console if `debug` is set to `true`. */
  private debug(message, ...args) {
    // ESLint: For debugging, will only log when "debug" is set to "true".
    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line no-console, security/detect-object-injection
    this[SYMBOL_OPTIONS].debug && console.info(`CustomAudioInputStream: ${message}`, ...args);
  }

  /** Implements this function. When called, it should start recording and return an `IAudioStreamNode`. */
  protected abstract performAttach(audioNodeId: string): Promise<{
    audioStreamNode: AudioStreamNode;
    deviceInfo: DeviceInfo;
    format: Format;
  }>;

  /** Attaches the device by returning an audio node. */
  attach(audioNodeId: string): Promise<AudioStreamNode> {
    this.debug(`Callback for "attach" with "${audioNodeId}".`);

    this.emitNodeAttaching(audioNodeId);

    return Promise.resolve().then<AudioStreamNode>(async () => {
      this.emitInitializing();

      try {
        const { audioStreamNode, deviceInfo, format } = await this.performAttach(audioNodeId);

        // Although only getter of "format" is called before "attach" (in Direct Line Speech),
        // we are handling both "deviceInfo" and "format" in similar way for uniformity.

        // False alarm: indexer is a constant of type Symbol.
        // eslint-disable-next-line security/detect-object-injection
        this[SYMBOL_DEVICE_INFO_DEFERRED].resolve(deviceInfo);

        // False alarm: indexer is a constant of type Symbol.
        // eslint-disable-next-line security/detect-object-injection
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

  /** Turn off the audio device. This is called before detaching from the graph. */
  // Speech SDK quirks: It is confused to have both "turnOff" and "detach". "turnOff" is called before "detach".
  //                    Why don't we put all logics at "detach"?
  // Speech SDK quirks: Direct Line Speech never call "turnOff". "Source off" event need to be emitted during "detach" instead.
  //                    Also, custom implementation should be done at "detach" instead, such as ending and closing output streams.
  async turnOff(): Promise<void> {
    this.debug(`Callback for "turnOff".`);

    await this.performTurnOff();
  }

  /** Gets the device information. */
  // ESLint: This code will only works in browsers other than IE11. Only works in ES5 is okay.
  // @ts-ignore Accessors are only available when targeting ECMAScript 5 and higher.ts(1056)
  get deviceInfo(): Promise<ISpeechConfigAudioDevice> {
    this.debug(`Getting "deviceInfo".`);

    // False alarm: indexer is a constant of type Symbol.
    // eslint-disable-next-line security/detect-object-injection
    return Promise.all([this[SYMBOL_DEVICE_INFO_DEFERRED].promise, this[SYMBOL_FORMAT_DEFERRED].promise]).then(
      ([{ connectivity, manufacturer, model, type }, { bitsPerSample, channels, samplesPerSec }]) => ({
        bitspersample: bitsPerSample,
        channelcount: channels,
        connectivity:
          typeof connectivity === 'string' && !isForbiddenPropertyName(connectivity)
            ? // Mitigated through denylisting.
              // eslint-disable-next-line security/detect-object-injection
              Connectivity[connectivity]
            : connectivity || Connectivity.Unknown,
        manufacturer: manufacturer || '',
        model: model || '',
        samplerate: samplesPerSec,
        // Mitigated through denylisting.
        // eslint-disable-next-line security/detect-object-injection
        type: typeof type === 'string' && !isForbiddenPropertyName(type) ? Type[type] : type || Type.Unknown
      })
    );
  }
}

export default CustomAudioInputStream;

export type { AudioStreamNode, DeviceInfo, Format, Options };
