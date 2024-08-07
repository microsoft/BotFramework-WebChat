import { type DirectLineCardAction } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo } from 'react';
import { useStyles } from '../../styles/index.js';
import StarterPromptsCardAction from './StarterPromptsCardAction.js';
import styles from './StarterPromptsToolbar.module.css';

type Props = Readonly<{
  cardActions: readonly DirectLineCardAction[];
  className?: string | undefined;
}>;

const StarterPrompts = ({ cardActions, className }: Props) => {
  const classNames = useStyles(styles);

  return (
    // TODO: Accessibility-wise, this should be role="toolbar" with keyboard navigation.
    <div className={cx(className, classNames['pre-chat-message-activity__card-action-toolbar'])}>
      <div className={classNames['pre-chat-message-activity__card-action-toolbar-grid']}>
        {cardActions
          .filter<DirectLineCardAction & { type: 'messageBack' }>(
            (card: DirectLineCardAction): card is DirectLineCardAction & { type: 'messageBack' } =>
              card.type === 'messageBack'
          )
          .map(cardAction => (
            <StarterPromptsCardAction key={cardAction.text} messageBackAction={cardAction} />
          ))}
      </div>
    </div>
  );
};

StarterPrompts.displayName = 'StarterPrompts';

export default memo(StarterPrompts);
