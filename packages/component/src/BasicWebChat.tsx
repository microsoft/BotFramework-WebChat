/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */
/* eslint react/no-unsafe: off */

import { hooks } from 'botframework-webchat-api';
import React, { FC } from 'react';

import BasicConnectivityStatus from './BasicConnectivityStatus';
import BasicSendBox from './BasicSendBox';
import BasicToaster from './BasicToaster';
import BasicTranscript from './BasicTranscript';
import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';

const { useStyleOptions } = hooks;

const CONNECTIVITY_STATUS_STYLE = {
  flexShrink: 0
};

const SEND_BOX_CSS = {
  flexShrink: 0
};

const TOASTER_STYLE = {
  flexShrink: 0
};

const TRANSCRIPT_STYLE = {
  flex: 1
};

type BasicWebChatProps = {};

const BasicWebChat: FC<BasicWebChatProps> = () => {
  const [options] = useStyleOptions();
  const styleToEmotionObject = useStyleToEmotionObject();

  const connectivityStatusClassName = styleToEmotionObject(CONNECTIVITY_STATUS_STYLE) + '';
  const sendBoxClassName = styleToEmotionObject(SEND_BOX_CSS) + '';
  const toasterClassName = styleToEmotionObject(TOASTER_STYLE) + '';
  const transcriptClassName = styleToEmotionObject(TRANSCRIPT_STYLE) + '';

  return (
    <React.Fragment>
      {!options.hideToaster && <BasicToaster className={toasterClassName} />}
      <BasicTranscript className={transcriptClassName} />
      <BasicConnectivityStatus className={connectivityStatusClassName} />
      {!options.hideSendBox && <BasicSendBox className={sendBoxClassName} />}
    </React.Fragment>
  );
};

BasicWebChat.defaultProps = {};
BasicWebChat.propTypes = {};

export default BasicWebChat;

export type { BasicWebChatProps };
