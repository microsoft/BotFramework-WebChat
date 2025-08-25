// TODO: Unsure why export * will not export anything for /__tests__/html2/samples.

// ```
// ▲ [WARNING] Import "activityComponent" will always be undefined because the file "../../../packages/bundle/dist/botframework-webchat.middleware.mjs" has no exports [import-is-undefined]
// ```

// export * from 'botframework-webchat-api/middleware';

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
  type ActivityPolymiddlewareRequest,
  type Polymiddleware
} from 'botframework-webchat-api/middleware';

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
} from 'botframework-webchat-api/middleware';
