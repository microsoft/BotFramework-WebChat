import { hooks } from 'botframework-webchat-api';
import { type DirectLineCardAction } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { Fragment, memo } from 'react';
import { useStyles } from '../../styles/index.js';
import StarterPromptsCardAction from './StarterPromptsCardAction.js';
import styles from './StarterPromptsToolbar.module.css';

const { useUIState } = hooks;

type Props = Readonly<{
  cardActions: readonly DirectLineCardAction[];
  className?: string | undefined;
}>;

const StarterPrompts = ({ cardActions, className }: Props) => {
  const classNames = useStyles(styles);
  const [uiState] = useUIState();

  return (
    // TODO: Accessibility-wise, this should be role="toolbar" with keyboard navigation.
    <div className={cx(className, classNames['pre-chat-message-activity__card-action-toolbar'])}>
      <div className={classNames['pre-chat-message-activity__card-action-toolbar-grid']}>
        {uiState === 'mock' ? (
          <Fragment>
            <StarterPromptsCardAction />
            <StarterPromptsCardAction />
            <StarterPromptsCardAction />
          </Fragment>
        ) : (
          cardActions
            .filter<
              DirectLineCardAction & { type: 'messageBack' }
            >((card: DirectLineCardAction): card is DirectLineCardAction & { type: 'messageBack' } => card.type === 'messageBack')
            .map(cardAction => <StarterPromptsCardAction key={cardAction.text} messageBackAction={cardAction} />)
        )}
      </div>
    </div>
  );
};

StarterPrompts.displayName = 'StarterPrompts';

export default memo(StarterPrompts);
