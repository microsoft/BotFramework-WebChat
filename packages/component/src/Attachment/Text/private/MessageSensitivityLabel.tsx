import classNames from 'classnames';
import React, { memo, useMemo } from 'react';

import ShieldIcon from './ShieldIcon';

type Props = Readonly<{
  className?: string | undefined;
  color?: string | undefined;
  isEncrypted?: boolean | undefined;
  text?: string | undefined;
  tooltip?: string | undefined; // TODO: Should we change it to "title" instead?
}>;

const MessageSensitivityLabel = memo(({ className, color, isEncrypted, text, tooltip }: Props) => (
  <div
    className={classNames('webchat__link-definitions__message-sensitivity-label', className)}
    title={useMemo(() => [text, tooltip].filter(Boolean).join('\n\n'), [text, tooltip])}
  >
    <ShieldIcon
      className="webchat__link-definitions__message-sensitivity-label-icon"
      fillColor={color}
      hasLock={isEncrypted}
    />
    <span className="webchat__link-definitions__message-sensitivity-label-text">{text}</span>
  </div>
));

MessageSensitivityLabel.displayName = 'MessageSensitivityLabel';

export default MessageSensitivityLabel;
