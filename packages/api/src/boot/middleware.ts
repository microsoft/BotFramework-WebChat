export { PolymiddlewareComposer, type Polymiddleware } from '@msinternal/botframework-webchat-api-middleware';

// Separated import sections for easier templating.

export {
  activityComponent,
  ActivityPolymiddlewareProxy,
  createActivityPolymiddleware,
  useBuildRenderActivityCallback,
  type ActivityPolymiddleware,
  type ActivityPolymiddlewareHandler,
  type ActivityPolymiddlewareHandlerResult,
  type ActivityPolymiddlewareProps,
  type ActivityPolymiddlewareProxyProps,
  type ActivityPolymiddlewareRenderer,
  type ActivityPolymiddlewareRequest
} from '@msinternal/botframework-webchat-api-middleware';

export {
  avatarComponent,
  AvatarPolymiddlewareProxy,
  createAvatarPolymiddleware,
  useBuildRenderAvatarCallback,
  type AvatarPolymiddleware,
  type AvatarPolymiddlewareHandler,
  type AvatarPolymiddlewareHandlerResult,
  type AvatarPolymiddlewareProps,
  type AvatarPolymiddlewareProxyProps,
  type AvatarPolymiddlewareRenderer,
  type AvatarPolymiddlewareRequest
} from '@msinternal/botframework-webchat-api-middleware';

export {
  createErrorBoxPolymiddleware,
  errorBoxComponent,
  ErrorBoxPolymiddlewareProxy,
  useBuildRenderErrorBoxCallback,
  // For type portability only.
  type __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol,
  type ErrorBoxPolymiddleware,
  type ErrorBoxPolymiddlewareHandler,
  type ErrorBoxPolymiddlewareHandlerResult,
  type ErrorBoxPolymiddlewareProps,
  type ErrorBoxPolymiddlewareProxyProps,
  type ErrorBoxPolymiddlewareRenderer,
  type ErrorBoxPolymiddlewareRequest
} from '@msinternal/botframework-webchat-api-middleware';

export {
  type LegacyActivityMiddleware,
  type LegacyAvatarMiddleware
} from '@msinternal/botframework-webchat-api-middleware/legacy';

export { default as createActivityPolymiddlewareFromLegacy } from '../legacy/createActivityPolymiddlewareFromLegacy';

export { default as createAvatarPolymiddlewareFromLegacy } from '../legacy/createAvatarPolymiddlewareFromLegacy';
