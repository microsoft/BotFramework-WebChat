# Telemetry system

In Web Chat 4.8, a new telemetry system is introduced. Developers can opt into this feature by implementing their own telemetry collection adapter and start pumping measurements into telemetry services of their choice.

Microsoft **does not** collect or receive any telemetry measurements for Web Chat on either the CDN or the NPM releases. Developers must provide their own telemetry collection adapter to start collecting data. Under local regulations, they may be required to provide privacy policies to the end-user to explain their data collection policy and provide a prompt.

## Collection

We have 2 samples for collecting telemetry measurements:

-  [Collecting telemetry measurements using Azure Application Insights](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/04.api/k.telemetry-application-insights)
-  [Collecting telemetry measurements using Google Analytics](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/04.api/l.telemetry-google-analytics)

## Measurements

We simplified our measurements to make it suitable for popular telemetry services:

-  Dimension: dimensions are environment information, including browser capabilities and options passed to Web Chat
-  Event: event will include a name, optional string data, and optional non-negative finite integer value
-  Exception: exception will include the JavaScript error object
-  Timing: timing will fire two events, `timingstart` and `timingend`
   -  `timingstart` will include a name
   -  `timingend` will include a name, and duration measured in milliseconds

Feature updates on minor versions may introduce new or remove outdated measurements. To better understand user behaviors with a different set of measurements, developers are advised to tag their telemetry data with the Web Chat version.

### Dimensions

The following information will be emitted on every measurement. Dimensions may change during the session.

| Name                                   | Description                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------- |
| `prop:locale`                          | Locale specified in props, normalized                                                     |
| `prop:speechRecognition`               | `"false"` if speech recognition is switched off                                           |
| `prop:speechSynthesis`                 | `"false"` if speech synthesis is switched off                                             |
| `capability:downscaleImage:workerType` | `"web worker"` if the browser supports Web Worker and offline canvas, otherwise, `"main"` |

> `prop:speechRecognition` and `prop:speechSynthesis` do not represent browser capabilities on Speech Recognition and Speech Synthesis.

Some telemetry services may have a limited number of dimensions. For example, Google Analytics has a limit of [20 custom dimensions](https://support.google.com/analytics/answer/2709828?hl=en) and [500 events per session](https://support.google.com/analytics/answer/9267744?hl=en). As Web Chat may introduce more dimensions later, developers are advised to pick dimensions they need before sending to their services.

### Events for hooks

When the following hooks are called, one or more event measurements will be emitted.

| Hooks              | Events          | Data          | Data type | Description                                               |
| ------------------ | --------------- | ------------- | --------- | --------------------------------------------------------- |
| `useSendFiles`     | `sendFiles`     |               |           | Emitted when the user uploading files                     |
|                    |                 | `numFile`     | `number`  | Number of files uploaded                                  |
|                    |                 | `sumSizeInKB` | `number`  | Total file size in kilobytes                              |
| `useSubmitSendBox` | `submitSendBox` |               |           | Emit when the user submit send box                        |
|                    |                 |               | `string`  | The method of submit, for example, `keyboard` or `speech` |

### Other events

| Name                 | Description                                                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init`               | Emit when telemetry system has initialized                                                                                                                                                                                            |
| `send-status:change` | Emit when activity status changes from `undefined` to `sending`, `sending` to `sent`, `sending` to `send failed` and `send failed` to `sent`. Including `status`, `prevStatus`, `clientActivityID`, `key`, `hasAttachment` and `type` |

### Exceptions

When the following conditions are met, an exception measurement will be emitted:

-  An `<ErrorBox>` component is rendered
   -  Failed to render an activity
   -  Failed to render an activity status
   -  Failed to render an attachment
   -  Failed to render a notification toast
   -  Failed to render the typing indicator
-  Activity renderer not found for a type of activity
-  Toast renderer not found for a type of notification
-  No typing indicator renderers were registered
-  Any exceptions raised while calling `useTrackTiming`

### Timings

The following operations are timed:

| Timing                    | Description                                                                       |
| ------------------------- | --------------------------------------------------------------------------------- |
| `sendFiles:makeThumbnail` | Time used to generate thumbnail for every uploading image via `useSendFiles` hook |

## Data collection

> For data collection, you must comply to your local regulations and may often need to provide a privacy policy to your end-user.

To collect measurements, you will need to pass an `onTelemetry` handler as a prop to Web Chat. The event emitted will be one of the types below:

```ts
interface TelemetryMeasurementEvent {
   type: string;
   dimension: any;
}

interface TelemetryEventMeasurementEvent extends TelemetryMeasurementEvent {
   type: 'event';
   name: string;
   level: 'debug' | 'info' | 'warn' | 'error';
   data?: number | string | { [key: string]: number | string };
}

interface TelemetryExceptionMeasurementEvent extends TelemetryMeasurementEvent {
   type: 'exception';
   error: Error;
   fatal: boolean;
}

interface TelemetryTimingStartMeasurementEvent extends TelemetryMeasurementEvent {
   type: 'timingstart';
   name: string;
   timingId: string;
}

interface TelemetryTimingEndMeasurementEvent extends TelemetryMeasurementEvent {
   type: 'timingend';
   name: string;
   timingId: string;
   duration: number;
}
```

To collect `send-status:change` events, the data emitted will be in the type below:

```ts
type TelemetrySendStatusChangePayload = {
   clientActivityID?: string;
   hasAttachment?: 'true' | 'false';
   key: string;
   prevStatus?: 'sending' | 'send failed' | 'sent';
   status: 'sending' | 'send failed' | 'sent';
   type?: string;
};
```

Web Chat may emit a large number of dimensions and measurements to your `onTelemetry` handler. As your telemetry service provider may limit number of dimensions and measurements for a single session or property, you are advised to pick and choose the data you needed before transmitting them to your provider.

## Hooks

To emit custom measurements through the `onTelemetry` handler, you can use one of the following hooks.

-  [`useTrackDimension`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md#usetrackdimension) to add/change/remove a dimension
-  [`useTrackEvent`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md#usetrackevent) to emit an event
-  [`useTrackException`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md#usetrackexception) to emit an exception
-  [`useTrackTiming`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md#usetracktiming) to emit a timing

Please refer to [`HOOKS.md`](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/HOOKS.md#telemetry) for API references.
