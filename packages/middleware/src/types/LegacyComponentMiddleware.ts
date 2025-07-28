import { type Enhancer, type Handler, type Middleware } from 'handler-chain';
import { type ComponentType } from 'react';

type LegacyComponentHandler<Request, Props extends object> = Handler<ComponentType<Props>, Request>;
type LegacyComponentEnhancer<Request, Props extends object> = Enhancer<ComponentType<Props>, Request>;
type LegacyComponentMiddleware<Request, Props extends object, Init> = Middleware<ComponentType<Props>, Request, Init>;

export { type LegacyComponentEnhancer, type LegacyComponentHandler, type LegacyComponentMiddleware };
