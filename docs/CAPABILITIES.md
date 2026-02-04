# Capabilities

Web Chat supports dynamic capability discovery from adapters. Capabilities allow adapters to expose configuration values that Web Chat components can consume and react to changes.

## Using the hook

Use the `useCapabilities` hook with a selector to access specific capabilities:

```js
import { useCapabilities } from 'botframework-webchat/hook';

// Get voice configuration
const voiceConfig = useCapabilities(caps => caps.voiceConfiguration);

if (voiceConfig) {
  console.log(`Sample rate: ${voiceConfig.sampleRate}`);
  console.log(`Chunk interval: ${voiceConfig.chunkIntervalMs}ms`);
}
```

> **Note:** A selector function is required. This ensures components only re-render when their specific capability changes.

## Available capabilities

| Capability           | Type                                               | Description                         |
| -------------------- | -------------------------------------------------- | ----------------------------------- |
| `voiceConfiguration` | `{ chunkIntervalMs: number, sampleRate: number }`  | Audio settings for Speech-to-Speech |

## How it works

1. **Initial fetch** - When WebChat mounts, it checks if the adapter exposes capability getter functions and retrieves initial values
2. **Event-driven updates** - When the adapter dispatches a `capabilitiesChanged` event, WebChat re-fetches all capabilities from the adapter
3. **Optimized re-renders** - Only components consuming changed capabilities will re-render

## For adapter implementers

To expose capabilities from your adapter, implement event listener methods and provide getter functions.

### 1. Create an EventTarget and implement getter functions

```js
const eventTarget = new EventTarget();

const adapter = {
  // ... other adapter methods

  getVoiceConfiguration() {
    return {
      sampleRate: 16000,
      chunkIntervalMs: 100
    };
  },
  addEventListener: eventTarget.addEventListener.bind(eventTarget),
  removeEventListener: eventTarget.removeEventListener.bind(eventTarget)
};
```

### 2. Dispatch change events internally

When capability values change, dispatch a `capabilitiesChanged` event using the internal EventTarget:

```js
// When configuration changes, dispatch the event internally
eventTarget.dispatchEvent(new Event('capabilitiesChanged'));
```

WebChat will then call all capability getter functions and update consumers if values changed.

## Adding new capabilities

To add a new capability:

1. Add the type to `Capabilities` in `packages/api/src/providers/Capabilities/types/Capabilities.ts`
2. Add the registry entry in `packages/api/src/providers/Capabilities/private/capabilityRegistry.ts`
3. Implement the getter in your adapter (e.g., `getMyCapability()`)

The registry maps capability keys to getter function names:

```js
// capabilityRegistry.ts
{
  key: 'voiceConfiguration',
  getterName: 'getVoiceConfiguration'
}
```
