import React, { memo } from 'react';
import { useStyles } from '../../styles';
import styles from './ErrorMessage.module.css';

function ErrorMessage(props: Readonly<{ id: string; error?: string | undefined }>) {
  const classNames = useStyles(styles);
  return (
    <span className={classNames['sendbox__error-message']} id={props.id} role="alert">
      {props.error}
    </span>
  );
}

export default memo(ErrorMessage);
