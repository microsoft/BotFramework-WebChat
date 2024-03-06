import React, { memo, useMemo } from 'react';

import classNames from 'classnames';
import ShieldIcon from './ShieldIcon';

type Props = Readonly<{
  className?: string | undefined;
  color?: string | undefined;
  isEncrypted?: boolean | undefined;
  text?: string | undefined;
  tooltip?: string | undefined; // TODO: Should we change it to "title" instead?
}>;

const MessageSensitivityLabel = memo(({ className, color, isEncrypted, text, tooltip }: Props) => (
  <div className={classNames('webchat__link-definitions__message-sensitivity-label', className)}>
    <ShieldIcon
      className="webchat__link-definitions__message-sensitivity-label-icon"
      fillColor={color}
      hasLock={isEncrypted}
    />
    <span
      className="webchat__link-definitions__message-sensitivity-label-text"
      title={useMemo(() => [text, tooltip].filter(Boolean).join('\n\n'), [text, tooltip])}
    >
      {text}
    </span>
  </div>
));

MessageSensitivityLabel.displayName = 'MessageSensitivityLabel';

export default MessageSensitivityLabel;
