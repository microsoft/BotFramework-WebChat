// TODO: Unsure why export * will not export anything for /__tests__/html2/samples.

// ```
// ▲ [WARNING] Import "activityComponent" will always be undefined because the file "../../../packages/bundle/dist/botframework-webchat.middleware.mjs" has no exports [import-is-undefined]
// ```

// export * from 'botframework-webchat-api/middleware';

export {
  activityComponent,
  ActivityPolyMiddlewareProvider,
  ActivityPolyMiddlewareProxy,
  // TODO: Rename to activityPolyMiddleware
  createActivityPolyMiddleware,
  useBuildRenderActivityCallback,
  type ActivityPolyMiddleware,
  type ActivityPolyMiddlewareHandler,
  type ActivityPolyMiddlewareHandlerResult,
  type ActivityPolyMiddlewareProps,
  type ActivityPolyMiddlewareProviderProps,
  type ActivityPolyMiddlewareProxyProps,
  type ActivityPolyMiddlewareRenderer,
  type ActivityPolyMiddlewareRequest,
  type PolyMiddleware
} from 'botframework-webchat-api/middleware';
