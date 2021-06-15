import { ReactNode } from 'react';

import Notification from './Notification';

type ToastProps = {
  notification: Notification;
};

type RenderToast = (props: ToastProps) => ReactNode;

type ToastEnhancer = (next: RenderToast) => RenderToast;
type ToastMiddleware = () => ToastEnhancer;

export default ToastMiddleware;

export type { RenderToast };
