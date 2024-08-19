import React, { memo } from 'react';
import { usePushToLiveRegion } from 'botframework-webchat-component/internal';
import styles from './ErrorMessage.module.css';
import { useStyles } from '../../styles';

function ErrorMessage({ error, id }: Readonly<{ id: string; error?: string | undefined }>) {
  const classNames = useStyles(styles);

  usePushToLiveRegion(() => error && <div className="sendbox__error-message__status">{error}</div>, [error]);

  return (
    // eslint-disable-next-line react/forbid-dom-props
    <span className={classNames['sendbox__error-message']} id={id}>
      {error}
    </span>
  );
}

export default memo(ErrorMessage);
