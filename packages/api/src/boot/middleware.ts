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
  buttonComponent,
  ButtonPolymiddlewareProxy,
  createButtonPolymiddleware,
  useBuildRenderButtonCallback,
  type ButtonPolymiddleware,
  type ButtonPolymiddlewareHandler,
  type ButtonPolymiddlewareHandlerResult,
  type ButtonPolymiddlewareProps,
  type ButtonPolymiddlewareProxyProps,
  type ButtonPolymiddlewareRenderer,
  type ButtonPolymiddlewareRequest
} from '@msinternal/botframework-webchat-api-middleware';

export {
  chatLauncherButtonComponent,
  ChatLauncherButtonPolymiddlewareProxy,
  createChatLauncherButtonPolymiddleware,
  useBuildRenderChatLauncherButtonCallback,
  type ChatLauncherButtonPolymiddleware,
  type ChatLauncherButtonPolymiddlewareHandler,
  type ChatLauncherButtonPolymiddlewareHandlerResult,
  type ChatLauncherButtonPolymiddlewareProps,
  type ChatLauncherButtonPolymiddlewareProxyProps,
  type ChatLauncherButtonPolymiddlewareRenderer,
  type ChatLauncherButtonPolymiddlewareRequest
} from '@msinternal/botframework-webchat-api-middleware';

export {
  createErrorBoxPolymiddleware,
  errorBoxComponent,
  ErrorBoxPolymiddlewareProxy,
  useBuildRenderErrorBoxCallback,
  type ErrorBoxPolymiddleware,
  type ErrorBoxPolymiddlewareHandler,
  type ErrorBoxPolymiddlewareHandlerResult,
  type ErrorBoxPolymiddlewareProps,
  type ErrorBoxPolymiddlewareProxyProps,
  type ErrorBoxPolymiddlewareRenderer,
  type ErrorBoxPolymiddlewareRequest
} from '@msinternal/botframework-webchat-api-middleware';

export {
  createPopoverPolymiddleware,
  popoverComponent,
  PopoverPolymiddlewareProxy,
  useBuildRenderPopoverCallback,
  type PopoverPolymiddleware,
  type PopoverPolymiddlewareHandler,
  type PopoverPolymiddlewareHandlerResult,
  type PopoverPolymiddlewareProps,
  type PopoverPolymiddlewareProxyProps,
  type PopoverPolymiddlewareRenderer,
  type PopoverPolymiddlewareRequest
} from '@msinternal/botframework-webchat-api-middleware';

export { default as createActivityPolymiddlewareFromLegacy } from '../legacy/createActivityPolymiddlewareFromLegacy';
