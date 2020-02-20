# Telemetry system

In Web Chat 4.8, telemetry system is introduced. Developers can opt into this feature by implementing their own telemetry collection adapter and start pumping measurements into telemetry services of their choice.

Microsoft do not collect or receive any telemetry measurements for Web Chat, on both CDN and NPM releases. Developers must provide their own telemetry collection adapter to start collecting data. Under local regulations, they may be required to provide privacy policy to the end-user to explain their data collection policy.

## Measurements

We simplified our measurements to make it suitable for popular telemetry services:

- Dimensions are environment information, including browser capabilities and options passed to Web Chat
- Events will include a name, optional string data, and optional non-negative finite integer value
- Exceptions will include the JavaScript error object
- Timings will fire two events, `timingstart` and `timingend`
   - `timingstart` will include a name
   - `timingend` will include a name, and duration measured in milliseconds

Feature updates on minor versions may introduce new or remove outdated measurements. To better understand user behaviors with different set of measurements, developers are advised to tag their telemetry data with Web Chat version.

### Dimensions

The following information will be emitted on every measurement. Dimensions may change during the session.

| Name                                   | Description                                                                              |
|----------------------------------------|------------------------------------------------------------------------------------------|
| `prop:locale`                          | Locale specified                                                                         |
| `prop:locale:numChange`                | Number of times locale has changed                                                       |
| `prop:speechRecognition`               | `"false"` if speech recognition is switched off                                          |
| `prop:speechSynthesis`                 | `"false"` if speech synthesis is switched off                                            |
| `capability:downscaleImage:workerType` | `"web worker"` if the browser support Web Worker and offline canvas, otherwise, `"main"` |

> `prop:speechRecognition` and `prop:speechSynthesis` does not represents browser capabilities on Speech Recognition and Speech Synthesis.

Some telemetry services may have limited number of dimensions. For example, Google Analytics has a limit of 20 custom dimensions. As Web Chat may introduce more dimensions later, developers are advised to pick dimensions they needed before sending to their services.

### Events for hooks

When the following hooks are called, one or more event measurements will be emitted.

| Hooks              | Events                  | Description                                               |
|--------------------|-------------------------|-----------------------------------------------------------|
| `useSendFiles`     | `sendFiles`             | Emit when the user uploading files                        |
| `useSendFiles`     | `sendFiles:numFile`     | Number of files uploaded                                  |
| `useSendFiles`     | `sendFiles:sumSizeInKB` | Total file size in kilobytes                              |
| `useSubmitSendBox` | `submitSendBox`         | `data` is the method of submit, for example, `"keyboard"` |

### Exceptions

### Timings

The following operations are timed:

| Timing                    | Description                                                                       |
|---------------------------|-----------------------------------------------------------------------------------|
| `sendFiles:makeThumbnail` | Time used to generate thumbnail for every uploading image via `useSendFiles` hook |

## Data collection

To collect measurements, you will need to pass an `onTelemetry` handler as a prop to Web Chat. The event emitted will be one of the types below:

```ts
interface TelemetryEventMeasurementEvent {
  type: 'event';
  dimensions: any;
  name: string;
  data?: string;
  value?: number;
}

interface TelemetryExceptionMeasurementEvent {
  type: 'exception';
  error: Error;
}

interface TelemetryTimingStartMeasurementEvent {
  type: 'timingstart';
  name: string;
  timingId: string;
}

interface TelemetryTimingEndMeasurementEvent {
  type: 'timingend';
  name: string;
  timingId: string;
  duration: number;
}
```

## Hooks

To emit custom measurements through the `onTelemetry` handler, you can use one of the following hooks.

### Events

```ts
useTrackEvent() =>
  (
    name: string,
    data?: string
  ) => void;
```

### Exceptions

```ts
useTrackException() =>
  (
    error: Exception
  ) => void;
```

### Timing

```ts
useTrackTiming() =>
  (
    name: string
  ) =>
    (() => void | Promise);
```

## Samples

### Google Analytics

-  20 custom dimensions
-  500 event hits per session
