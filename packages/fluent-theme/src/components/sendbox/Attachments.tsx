import { hooks } from 'botframework-webchat-api';
import React, { memo } from 'react';
import { useStyles } from '../../styles';

const { useLocalizer } = hooks;

const styles = {
  'webchat-fluent__sendbox__attachment': {
    border: '1px solid var(--webchat-colorNeutralStroke1)',
    borderRadius: 'var(--webchat-borderRadiusLarge)',
    cursor: 'default',
    padding: '6px 8px',
    width: 'fit-content'
  }
};

const attachmentsPluralStringIds = {
  one: 'TEXT_INPUT_ATTACHMENTS_ONE',
  two: 'TEXT_INPUT_ATTACHMENTS_TWO',
  few: 'TEXT_INPUT_ATTACHMENTS_FEW',
  many: 'TEXT_INPUT_ATTACHMENTS_MANY',
  other: 'TEXT_INPUT_ATTACHMENTS_OTHER'
};

function Attachments({
  attachments
}: Readonly<{
  readonly attachments: readonly Readonly<{ blob: Blob | File; thumbnailURL?: URL | undefined }>[];
}>) {
  const classNames = useStyles(styles);
  const localizeWithPlural = useLocalizer({ plural: true });

  return attachments.length ? (
    <div className={classNames['webchat-fluent__sendbox__attachment']}>
      {localizeWithPlural(attachmentsPluralStringIds, attachments.length)}
    </div>
  ) : null;
}

export default memo(Attachments);
