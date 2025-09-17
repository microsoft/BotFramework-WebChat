import { useLiveRegion } from 'botframework-webchat/internal';
import React, { memo } from 'react';
import { useStyles } from '../../styles';
import styles from './ErrorMessage.module.css';

type ErrorMessageProps = Readonly<{
  error?: string | undefined;
  id: string;
}>;

function ErrorMessage({ error, id }: ErrorMessageProps) {
  const classNames = useStyles(styles);

  useLiveRegion(() => error && <div className="sendbox__error-message__status">{error}</div>, [error]);

  return (
    // eslint-disable-next-line react/forbid-dom-props
    <span className={classNames['sendbox__error-message']} id={id}>
      {error}
    </span>
  );
}

ErrorMessage.displayName = 'ErrorMessage';

export default memo(ErrorMessage);
