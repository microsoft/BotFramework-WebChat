import React, { memo, useMemo } from 'react';
import { useLiveRegionAnnouncement } from 'botframework-webchat-component/internal';
import styles from './ErrorMessage.module.css';
import { useStyles } from '../../styles';

function ErrorMessage({ error, id }: Readonly<{ id: string; error?: string | undefined }>) {
  const classNames = useStyles(styles);
  const queueElementAnnouncement = useLiveRegionAnnouncement();

  useMemo(
    () => error && queueElementAnnouncement(<div className="sendbox__error-message__status">{error}</div>),
    [error, queueElementAnnouncement]
  );
  return (
    // eslint-disable-next-line react/forbid-dom-props
    <span className={classNames['sendbox__error-message']} id={id}>
      {error}
    </span>
  );
}

export default memo(ErrorMessage);
