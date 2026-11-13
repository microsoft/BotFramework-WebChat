import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React from 'react';

import { ComponentIcon } from '../../Icon';
import styles from '../../SendBox/SendBox.module.css';

type Props = Readonly<{ checked: boolean }>;

const AttachmentIcon = ({ checked }: Props) => {
  const classNames = useStyles(styles, webChatPrefixedClassName);

  return (
    <div className={cx(classNames['attachment-icon'], { 'webchat__attachment-icon--checked': checked })}>
      <ComponentIcon
        appearance="text"
        className={classNames['attachment-icon__icon']}
        icon={checked ? 'attachment-checkmark' : 'attachment'}
      />
    </div>
  );
};

export default AttachmentIcon;
