export * from '../actual/decorator';

// Types are exported here instead of `../actual/decorator`, see the namespaces in `./minimal.ts`.
export {
  type ActivityBorderDecoratorProps,
  type DecoratorMiddleware,
  type InferDecoratorRequest
} from 'botframework-webchat-api/decorator.js';
