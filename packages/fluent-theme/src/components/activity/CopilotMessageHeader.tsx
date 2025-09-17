import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat';
import { type WebChatActivity } from 'botframework-webchat/internal';
import cx from 'classnames';
import React, { memo, useMemo, type CSSProperties } from 'react';
import { custom, object, optional, pipe, readonly, safeParse, string, type InferInput } from 'valibot';

import { useStyles } from '../../styles';
import styles from './CopilotMessageHeader.module.css';
import isAIGeneratedActivity from './private/isAIGeneratedActivity';
import useActivityAuthor from './private/useActivityAuthor';
import useActivityStyleOptions from './private/useActivityStyleOptions';

const { useLocalizer } = hooks;

const copilotMessageHeaderPropsSchema = pipe(
  object({
    activity: optional(custom<Readonly<WebChatActivity>>(value => safeParse(object({}), value).success)),
    className: optional(string())
  }),
  readonly()
);

type CopilotMessageHeaderProps = InferInput<typeof copilotMessageHeaderPropsSchema>;

function CopilotMessageHeader(props: CopilotMessageHeaderProps) {
  const { activity, className } = validateProps(copilotMessageHeaderPropsSchema, props);

  const [{ botAvatarImage, botAvatarBackgroundColor }] = useActivityStyleOptions(activity);
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const isAIGenerated = isAIGeneratedActivity(activity);

  const avatarStyle = useMemo(
    () => ({ '--background-color': botAvatarBackgroundColor }) as CSSProperties,
    [botAvatarBackgroundColor]
  );

  const author = useActivityAuthor(activity);
  const avatarImage = author?.image || botAvatarImage;
  const botTitle = author?.name || activity?.from?.name;

  return (
    <div className={cx(classNames['copilot-message-header'], className)}>
      {avatarImage && (
        <img
          alt={localize('AVATAR_ALT', botTitle)}
          className={classNames['copilot-message-header__avatar']}
          src={avatarImage}
          style={avatarStyle}
        />
      )}
      <span className={classNames['copilot-message-header__title']} title={botTitle}>
        {botTitle}
      </span>
      {isAIGenerated && (
        <span className={classNames['copilot-message-header__ai-generated-content']}>
          {localize('ACTIVITY_CONTENT_CAUTION')}
        </span>
      )}
    </div>
  );
}

export default memo(CopilotMessageHeader);
export { copilotMessageHeaderPropsSchema, type CopilotMessageHeaderProps };
