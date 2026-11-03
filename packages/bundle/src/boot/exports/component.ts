export * from '../actual/component/full';

// Types are exported here instead of `../actual/component/minimal`, see the namespaces in `./minimal.ts`.
export {
  type BasicWebChatProps,
  type ComposerProps,
  type ReactWebChatProps
} from 'botframework-webchat-component/component.js';
