type BaseTelemetryMeasurementEvent = {
  dimension?: any;
};

type TelemetryEventMeasurementEvent = BaseTelemetryMeasurementEvent & {
  type: 'event';
  name: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  data?: number | string | { [key: string]: number | string };
};

type TelemetryExceptionMeasurementEvent = BaseTelemetryMeasurementEvent & {
  type: 'exception';
  error: Error;
  fatal: boolean;
};

type TelemetryTimingStartMeasurementEvent = BaseTelemetryMeasurementEvent & {
  type: 'timingstart';
  name: string;
  timingId: string;
};

type TelemetryTimingEndMeasurementEvent = BaseTelemetryMeasurementEvent & {
  type: 'timingend';
  name: string;
  timingId: string;
  duration: number;
};

type TelemetryMeasurementEvent =
  | TelemetryEventMeasurementEvent
  | TelemetryExceptionMeasurementEvent
  | TelemetryTimingStartMeasurementEvent
  | TelemetryTimingEndMeasurementEvent;

export default TelemetryMeasurementEvent;

export {
  TelemetryEventMeasurementEvent,
  TelemetryExceptionMeasurementEvent,
  TelemetryTimingStartMeasurementEvent,
  TelemetryTimingEndMeasurementEvent
};
