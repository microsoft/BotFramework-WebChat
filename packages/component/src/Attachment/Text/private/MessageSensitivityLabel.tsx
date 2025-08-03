import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { memo, useMemo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import ShieldIcon from './ShieldIcon';

const messageSensitivityLabelPropsSchema = pipe(
  object({
    className: optional(string()),
    color: optional(string()),
    isEncrypted: optional(boolean()),
    name: optional(string()),
    title: optional(string())
  }),
  readonly()
);

type MessageSensitivityLabelProps = InferInput<typeof messageSensitivityLabelPropsSchema>;

function MessageSensitivityLabel(props: MessageSensitivityLabelProps) {
  const { className, color, isEncrypted, name, title } = validateProps(messageSensitivityLabelPropsSchema, props);

  return (
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
  );
}

export default memo(MessageSensitivityLabel);
export { messageSensitivityLabelPropsSchema, type MessageSensitivityLabelProps };
