import React, { memo } from 'react';
import styles from './ErrorMessage.module.css';
import { useStyles } from '../../styles';

function ErrorMessage(props: Readonly<{ id: string; error?: string | undefined }>) {
  const classNames = useStyles(styles);
  return (
    // eslint-disable-next-line react/forbid-dom-props
    <span className={classNames['webchat-fluent___sendbox__error-message']} id={props.id} role="alert">
      {props.error}
    </span>
  );
}

export default memo(ErrorMessage);
