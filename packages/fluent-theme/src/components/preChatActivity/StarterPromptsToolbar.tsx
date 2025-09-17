import { hooks } from 'botframework-webchat';
import { type DirectLineCardAction } from 'botframework-webchat/internal';
import cx from 'classnames';
import React, { memo } from 'react';
import { useStyles } from '../../styles/index.js';
import StarterPromptsCardAction from './StarterPromptsCardAction.js';
import styles from './StarterPromptsToolbar.module.css';

const { useUIState } = hooks;

type Props = Readonly<{
  cardActions: readonly DirectLineCardAction[];
  className?: string | undefined;
}>;

const StarterPromptsToolbar = ({ cardActions, className }: Props) => {
  const classNames = useStyles(styles);
  const [uiState] = useUIState();

  return (
    // TODO: Accessibility-wise, this should be role="toolbar" with keyboard navigation.
    <div className={cx(className, classNames['pre-chat-message-activity__card-action-toolbar'])}>
      <div className={classNames['pre-chat-message-activity__card-action-toolbar-grid']}>
        {uiState !== 'blueprint' &&
          cardActions
            .filter<DirectLineCardAction & { type: 'messageBack' }>(
              (card: DirectLineCardAction): card is DirectLineCardAction & { type: 'messageBack' } =>
                card.type === 'messageBack'
            )
            // There is no other usable keys in card actions.
            // eslint-disable-next-line react/no-array-index-key
            .map((cardAction, index) => <StarterPromptsCardAction key={index} messageBackAction={cardAction} />)}
      </div>
    </div>
  );
};

StarterPromptsToolbar.displayName = 'StarterPromptsToolbar';

export default memo(StarterPromptsToolbar);
