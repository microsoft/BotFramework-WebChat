/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */
/* eslint react/no-unsafe: off */

import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC } from 'react';

import AccessKeySinkSurface from './Utils/AccessKeySink/Surface';
import BasicConnectivityStatus from './BasicConnectivityStatus';
import BasicSendBox from './BasicSendBox';
import BasicToaster from './BasicToaster';
import BasicTranscript from './BasicTranscript';
import useStyleSet from './hooks/useStyleSet';
import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';

const { useStyleOptions } = hooks;

const ROOT_STYLE = {
  display: 'flex',
  flexDirection: 'column'
};

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

// Subset of landmark roles: https://w3.org/TR/wai-aria/#landmark_roles
const ARIA_LANDMARK_ROLES = ['complementary', 'contentinfo', 'form', 'main', 'region'];

type BasicWebChatProps = {
  className?: string;
  role?: 'complementary' | 'contentinfo' | 'form' | 'main' | 'region';
};

const BasicWebChat: FC<BasicWebChatProps> = ({ className, role }) => {
  const [{ root: rootStyleSet }] = useStyleSet();
  const [options] = useStyleOptions();
  const styleToEmotionObject = useStyleToEmotionObject();

  const connectivityStatusClassName = styleToEmotionObject(CONNECTIVITY_STATUS_STYLE) + '';
  const rootClassName = styleToEmotionObject(ROOT_STYLE) + '';
  const sendBoxClassName = styleToEmotionObject(SEND_BOX_CSS) + '';
  const toasterClassName = styleToEmotionObject(TOASTER_STYLE) + '';
  const transcriptClassName = styleToEmotionObject(TRANSCRIPT_STYLE) + '';

  // Fallback to "complementary" if specified is not a valid landmark role.
  if (!ARIA_LANDMARK_ROLES.includes(role)) {
    role = 'complementary';
  }

  return (
    <AccessKeySinkSurface className={classNames(rootClassName, rootStyleSet + '', (className || '') + '')} role={role}>
      {!options.hideToaster && <BasicToaster className={toasterClassName} />}
      <BasicTranscript className={transcriptClassName} />
      <BasicConnectivityStatus className={connectivityStatusClassName} />
      {!options.hideSendBox && <BasicSendBox className={sendBoxClassName} />}
    </AccessKeySinkSurface>
  );
};

BasicWebChat.defaultProps = {
  className: '',
  role: 'complementary'
};

BasicWebChat.propTypes = {
  className: PropTypes.string,
  // Ignoring deficiencies with TypeScript/PropTypes inference.
  // @ts-ignore
  role: PropTypes.oneOf(ARIA_LANDMARK_ROLES)
};

export default BasicWebChat;

export type { BasicWebChatProps };
