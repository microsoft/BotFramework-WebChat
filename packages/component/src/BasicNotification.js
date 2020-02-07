/* eslint react/no-danger: "off" */

import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import Notification from './Notification/Notification';
import ScreenReaderText from './ScreenReaderText';
import useDismissNotification from './hooks/useDismissNotification';
import useInternalRenderMarkdownInline from './hooks/internal/useInternalRenderMarkdownInline';

const BasicNotification = ({ notification: { alt, id, level, message } }) => {
  const dismissNotification = useDismissNotification();
  const handleDismiss = useCallback(() => dismissNotification(id), [dismissNotification, id]);
  const renderMarkdownInline = useInternalRenderMarkdownInline();
  const html = useMemo(() => ({ __html: renderMarkdownInline(message) }), [renderMarkdownInline, message]);

  return (
    <Notification alt={alt || message} level={level} onDismiss={handleDismiss}>
      {!!alt && <ScreenReaderText text={alt} />}
      <div aria-hidden={!!alt} className="webchat__notification__text" dangerouslySetInnerHTML={html} />
    </Notification>
  );
};

BasicNotification.propTypes = {
  notification: PropTypes.shape({
    alt: PropTypes.string,
    id: PropTypes.string.isRequired,
    level: PropTypes.oneOf(['error', 'warn', 'info', 'success']).isRequired,
    message: PropTypes.string.isRequired
  }).isRequired
};

export default BasicNotification;
