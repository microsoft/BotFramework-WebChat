import { ReactNode } from 'react';

import Notification from './Notification';

type ToastProps = {
  notification: Notification;
};

export type RenderToast = (props: ToastProps) => ReactNode;

type ToastEnhancer = (next: RenderToast) => RenderToast;
type ToastMiddleware = () => ToastEnhancer;

export default ToastMiddleware;
