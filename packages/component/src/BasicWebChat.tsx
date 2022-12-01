/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */
/* eslint react/no-unsafe: off */

import { hooks } from 'botframework-webchat-api';
import React, { FC } from 'react';

import BasicConnectivityStatus from './BasicConnectivityStatus';
import BasicSendBox from './BasicSendBox';
import BasicToaster from './BasicToaster';
import BasicTranscript from './BasicTranscript';

const { useStyleOptions } = hooks;

type BasicWebChatProps = {};

const BasicWebChat: FC<BasicWebChatProps> = () => {
  const [options] = useStyleOptions();

  return (
    <React.Fragment>
      {!options.hideToaster && <BasicToaster />}
      <BasicTranscript />
      <BasicConnectivityStatus />
      {!options.hideSendBox && <BasicSendBox />}
    </React.Fragment>
  );
};

BasicWebChat.defaultProps = {};
BasicWebChat.propTypes = {};

export default BasicWebChat;

export type { BasicWebChatProps };
