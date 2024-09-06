import { hooks } from 'botframework-webchat-component';
import cx from 'classnames';
import React, { memo } from 'react';
import { useStyles } from '../../styles';
import styles from './Attachments.module.css';

const { useLocalizer, useUIState } = hooks;

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
  const [uiState] = useUIState();
  const classNames = useStyles(styles);
  const localizeWithPlural = useLocalizer({ plural: true });

  return uiState !== 'blueprint' && attachments.length ? (
    <div className={cx(classNames['sendbox__attachment'], className)}>
      {localizeWithPlural(attachmentsPluralStringIds, attachments.length)}
    </div>
  ) : null;
}

export default memo(Attachments);
