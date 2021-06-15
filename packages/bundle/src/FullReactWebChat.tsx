import PropTypes from 'prop-types';
import React, { VFC } from 'react';
import ReactWebChat, { ReactWebChatProps } from 'botframework-webchat-component';

import AddFullBundle, { AddFullBundleProps } from './AddFullBundle';

type FullReactWebChatProps = ReactWebChatProps & Omit<AddFullBundleProps, 'children'>;

// Add additional props to <WebChat>, so it support additional features
const FullReactWebChat: VFC<FullReactWebChatProps> = props => (
  <AddFullBundle {...props}>{extraProps => <ReactWebChat {...props} {...extraProps} />}</AddFullBundle>
);

FullReactWebChat.defaultProps = {
  ...ReactWebChat.defaultProps,
  adaptiveCardHostConfig: undefined,
  adaptiveCardsHostConfig: undefined,
  adaptiveCardsPackage: undefined,
  renderMarkdown: undefined
};

FullReactWebChat.propTypes = {
  ...ReactWebChat.propTypes,
  adaptiveCardHostConfig: PropTypes.any,
  adaptiveCardsHostConfig: PropTypes.any,
  adaptiveCardsPackage: PropTypes.any,
  renderMarkdown: PropTypes.func
};

export default FullReactWebChat;

export type { FullReactWebChatProps };
