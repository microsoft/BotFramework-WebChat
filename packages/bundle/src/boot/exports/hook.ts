export * from '../actual/hook/full';

// Types are exported here instead of `../actual/hook/minimal`, see the namespaces in `./minimal.ts`.
export { type DropZoneState, type SendBoxFocusOptions } from 'botframework-webchat-component/hook.js';
