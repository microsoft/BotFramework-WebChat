// Type declarations for the JavaScript entry point (`index.js`), keep them in sync.

import type { AudioConfig } from 'microsoft-cognitiveservices-speech-sdk';
import type { createSpeechRecognitionPonyfillFromRecognizer } from 'web-speech-cognitive-services';

type Activity = { [key: string]: any; type?: string | undefined };

type Observer<T> = {
  complete?(): void;
  error?(error: unknown): void;
  next?(value: T): void;
};

type Subscription = { readonly closed: boolean; unsubscribe(): void };

type Observable<T> = {
  subscribe(observer: Observer<T>): Subscription;
  subscribe(next: (value: T) => void, error?: (error: unknown) => void, complete?: () => void): Subscription;
};

type DirectLineSpeechCredentials = {
  /** Authorization token, mutually exclusive with `subscriptionKey`. */
  authorizationToken?: string | undefined;
  /** Host name of the Direct Line Speech channel, mutually exclusive with `region`. */
  directLineSpeechHostname?: string | undefined;
  /** Direct Line token, required when `enableInternalHTTPSupport` is set. */
  directLineToken?: string | undefined;
  /** Azure region of the Speech resource, mutually exclusive with `directLineSpeechHostname`. */
  region?: string | undefined;
  /** Subscription key, mutually exclusive with `authorizationToken`. */
  subscriptionKey?: string | undefined;
};

type CreateAdaptersInit = {
  audioConfig?: AudioConfig | undefined;
  audioContext?: AudioContext | undefined;
  audioInputDeviceId?: string | undefined;
  enableInternalHTTPSupport?: boolean | undefined;
  /** Not supported yet, ignored with a warning. */
  enableTelemetry?: boolean | undefined;
  /** Credentials, or a function returning them. Called again on every token renewal. */
  fetchCredentials:
    | DirectLineSpeechCredentials
    | Promise<DirectLineSpeechCredentials>
    | (() => DirectLineSpeechCredentials | Promise<DirectLineSpeechCredentials>);
  /** Not supported yet, ignored with a warning. */
  speechRecognitionEndpointId?: string | undefined;
  speechRecognitionLanguage?: string | undefined;
  /** Not supported yet, ignored with a warning. */
  speechSynthesisDeploymentId?: string | undefined;
  /** Not supported yet, ignored with a warning. */
  speechSynthesisOutputFormat?: string | undefined;
  /** Not supported yet, ignored with a warning. */
  textNormalization?: 'display' | 'itn' | 'lexical' | 'maskeditn' | undefined;
  /** Sent as the conversation's "from" ID, although a warning says custom user IDs are not supported. */
  userID?: string | undefined;
  /** Not supported yet, ignored with a warning. */
  username?: string | undefined;
};

type DirectLineSpeech = {
  readonly activity$: Observable<Activity>;
  /** Values of `ConnectionStatus` in `botframework-directlinejs`. */
  readonly connectionStatus$: Observable<number>;
  end(): void;
  postActivity(activity: Activity): Observable<string>;
};

/** Empty when the browser does not support Web Audio API. */
type WebSpeechPonyfill = Partial<
  Pick<ReturnType<typeof createSpeechRecognitionPonyfillFromRecognizer>, 'SpeechGrammarList' | 'SpeechRecognition'> & {
    speechSynthesis: SpeechSynthesis;
    SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance;
  }
>;

declare const buildInfo: {
  readonly buildTool: string | undefined;
  readonly moduleFormat: string | undefined;
  readonly version: string | undefined;
};

declare function createAdapters(init: CreateAdaptersInit): Promise<{
  directLine: DirectLineSpeech;
  webSpeechPonyfillFactory: () => WebSpeechPonyfill;
}>;

export { buildInfo, createAdapters };

export type { CreateAdaptersInit, DirectLineSpeech, DirectLineSpeechCredentials, WebSpeechPonyfill };
