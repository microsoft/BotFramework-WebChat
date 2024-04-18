import { hooks } from 'botframework-webchat-component';
import React, { memo } from 'react';
import cx from 'classnames';
import styles from './Attachments.module.css';
import { useStyles } from '../../styles';

const { useLocalizer } = hooks;

const attachmentsPluralStringIds = {
  one: 'TEXT_INPUT_ATTACHMENTS_ONE',
  two: 'TEXT_INPUT_ATTACHMENTS_TWO',
  few: 'TEXT_INPUT_ATTACHMENTS_FEW',
  many: 'TEXT_INPUT_ATTACHMENTS_MANY',
  other: 'TEXT_INPUT_ATTACHMENTS_OTHER'
};

function Attachments({
  attachments,
  className
}: Readonly<{
  readonly attachments: readonly Readonly<{ blob: Blob | File; thumbnailURL?: URL | undefined }>[];
  readonly className?: string | undefined;
}>) {
  const classNames = useStyles(styles);
  const localizeWithPlural = useLocalizer({ plural: true });

  return attachments.length ? (
    <div className={cx(classNames['sendbox__attachment'], className)}>
      {localizeWithPlural(attachmentsPluralStringIds, attachments.length)}
    </div>
  ) : null;
}

export default memo(Attachments);
