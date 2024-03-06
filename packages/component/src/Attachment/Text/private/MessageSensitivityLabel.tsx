import React, { memo } from 'react';

import classNames from 'classnames';
import ShieldIcon from './ShieldIcon';

type Props = Readonly<{
  className?: string | undefined;
  text?: string | undefined;
}>;

const MessageSensitivityLabel = memo(({ className, text = 'Confidential\\Any User (No protection)' }: Props) => (
  <div className={classNames('webchat__link-definitions__message-sensitivity-label', className)}>
    <ShieldIcon
      className="webchat__link-definitions__message-sensitivity-label-icon"
      fillColor="Orange"
      hasLock={true}
    />
    <span className="webchat__link-definitions__message-sensitivity-label-text">{text}</span>
  </div>
));

MessageSensitivityLabel.displayName = 'MessageSensitivityLabel';

export default MessageSensitivityLabel;
