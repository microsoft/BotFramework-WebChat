import classNames from 'classnames';
import React, { memo, useMemo } from 'react';

import ShieldIcon from './ShieldIcon';

type MessageSensitivityLabelProps = Readonly<{
  className?: string | undefined;
  color?: string | undefined;
  isEncrypted?: boolean | undefined;
  name?: string | undefined;
  title?: string | undefined;
}>;

const MessageSensitivityLabel = memo(({ className, color, isEncrypted, name, title }: MessageSensitivityLabelProps) => (
  <div
    className={classNames(
      'webchat__link-definitions__message-sensitivity-label',
      {
        'webchat__link-definitions__message-sensitivity-label--is-encrypted': isEncrypted
      },
      className
    )}
    title={useMemo(() => [name, title].filter(Boolean).join('\n\n'), [name, title])}
  >
    <ShieldIcon
      className="webchat__link-definitions__message-sensitivity-label-icon"
      fillColor={color}
      hasLock={isEncrypted}
    />
    <span className="webchat__link-definitions__message-sensitivity-label-text">{name}</span>
  </div>
));

MessageSensitivityLabel.displayName = 'MessageSensitivityLabel';

export default MessageSensitivityLabel;

export type { MessageSensitivityLabelProps };
