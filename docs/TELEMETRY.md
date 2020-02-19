# Telemetry system

## Type of metrics

### Events

### Exceptions

### Timing

## Data collection

```ts
onTelemetry(
  'event',
  name: string,
  dataOrValue?: object | number
) => void;

onTelemetry(
  'exception',
  error: Exception
) => void;

onTelemetry(
  'timing',
  name: string,
  processingTime: number
) => void;
```

## Measurements

## Hooks

### Events

```ts
useTrackEvent() =>
  (
    name: string,
    dataOrValue?: object | number
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
    () => void;
```
