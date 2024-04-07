import { hooks, type SendBoxMiddleware, type SendBoxMiddlewareProps } from 'botframework-webchat-api';
import React from 'react';

import BasicSendBox from './BasicSendBox';

const { useStyleOptions } = hooks;

const HideableSendBox = ({ className }: SendBoxMiddlewareProps) => {
  const [{ hideSendBox }] = useStyleOptions();

  return hideSendBox ? false : <BasicSendBox className={className} />;
};

const createMiddleware = (): readonly SendBoxMiddleware[] => Object.freeze([() => () => () => HideableSendBox]);

export default createMiddleware;
