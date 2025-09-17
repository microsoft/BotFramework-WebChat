import { hooks } from 'botframework-webchat';
import { type DirectLineCardAction } from 'botframework-webchat/internal';
import cx from 'classnames';
import React, { MouseEventHandler, memo, useCallback } from 'react';

import { useStyles } from '../../styles';
import testIds from '../../testIds';
import AccessibleButton from './AccessibleButton';
import { useRovingFocusItemRef } from './private/rovingFocus';
import styles from './SuggestedAction.module.css';

const { useFocus, usePerformCardAction, useScrollToEnd, useStyleSet, useSuggestedActionsHooks, useUIState } = hooks;

type SuggestedActionProps = Readonly<{
  buttonText: string | undefined;
  className?: string | undefined;
  displayText?: string | undefined;
  image?: string | undefined;
  imageAlt?: string | undefined;
  itemIndex: number;
  text?: string | undefined;
  type?:
    | 'call'
    | 'downloadFile'
    | 'imBack'
    | 'messageBack'
    | 'openUrl'
    | 'playAudio'
    | 'playVideo'
    | 'postBack'
    | 'showImage'
    | 'signin';
  value?: any;
}>;

function SuggestedAction({
  buttonText,
  className,
  displayText,
  image,
  imageAlt,
  itemIndex,
  text,
  type,
  value
}: SuggestedActionProps) {
  const [_, setSuggestedActions] = useSuggestedActionsHooks().useSuggestedActions();
  const [{ suggestedAction: suggestedActionStyleSet }] = useStyleSet();
  const [uiState] = useUIState();
  const focus = useFocus();
  const focusRef = useRovingFocusItemRef<HTMLButtonElement>(itemIndex);
  const performCardAction = usePerformCardAction();
  const classNames = useStyles(styles);
  const scrollToEnd = useScrollToEnd();

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    ({ target }) => {
      (async function () {
        // We need to focus to the send box before we are performing this card action.
        // The will make sure the focus is always on Web Chat.
        // Otherwise, the focus may momentarily send to `document.body` and screen reader will be confused.
        await focus('sendBoxWithoutKeyboard');

        // TODO: [P3] #XXX We should not destruct DirectLineCardAction into React props and pass them in. It makes typings difficult.
        //       Instead, we should pass a "cardAction" props.
        performCardAction({ displayText, text, type, value } as DirectLineCardAction, { target });

        // Since "openUrl" action do not submit, the suggested action buttons do not hide after click.
        type === 'openUrl' && setSuggestedActions([]);

        scrollToEnd();
      })();
    },
    [displayText, focus, performCardAction, scrollToEnd, setSuggestedActions, text, type, value]
  );

  return (
    <AccessibleButton
      className={cx(classNames['suggested-action'], suggestedActionStyleSet + '', (className || '') + '')}
      data-testid={testIds.sendBoxSuggestedAction}
      disabled={uiState === 'disabled'}
      onClick={handleClick}
      ref={focusRef}
      type="button"
    >
      {image && <img alt={imageAlt} className={classNames['suggested-action__image']} src={image} />}
      <span>{buttonText}</span>
    </AccessibleButton>
  );
}

export default memo(SuggestedAction);
