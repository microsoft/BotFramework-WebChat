import { type ComponentType } from 'react';

import { type GenericEnhancer, type GenericHandler, type GenericMiddleware } from './GenericMiddleware';

type LegacyComponentHandler<Request, Props extends object> = GenericHandler<ComponentType<Props>, Request>;
type LegacyComponentEnhancer<Request, Props extends object> = GenericEnhancer<ComponentType<Props>, Request>;
type LegacyComponentMiddleware<Request, Props extends object, Init> = GenericMiddleware<
  ComponentType<Props>,
  Request,
  Init
>;

export { type LegacyComponentEnhancer, type LegacyComponentHandler, type LegacyComponentMiddleware };
