# Telemetry system

## Type of measurements

### Events

### Exceptions

### Timing

## Data collection

```ts
onTelemetry(
  'event',
  name: string,
  data?: string
) => void;

onTelemetry(
  'exception',
  error: Exception
) => void;

onTelemetry(
  'timingstart',
  name: string
) => void;

onTelemetry(
  'timingend',
  name: string,
  duration: number
) => void;
```

## Measurements

## Hooks

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

- 20 custom dimensions
- 500 event hits per session
