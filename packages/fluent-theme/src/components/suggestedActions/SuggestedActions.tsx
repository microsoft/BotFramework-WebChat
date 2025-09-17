import { hooks } from 'botframework-webchat';
import cx from 'classnames';
import React, { memo, useCallback, type ReactNode } from 'react';

import { useStyles } from '../../styles';
import { isPreChatMessageActivity } from '../preChatActivity';
import computeSuggestedActionText from './private/computeSuggestedActionText';
import RovingFocusProvider from './private/rovingFocus';
import SuggestedAction from './SuggestedAction';
import styles from './SuggestedActions.module.css';

const { useFocus, useLocalizer, useStyleOptions, useStyleSet, useSuggestedActionsHooks, useUIState } = hooks;

function SuggestedActionStackedOrFlowContainer(
  props: Readonly<{
    'aria-label'?: string | undefined;
    children?: ReactNode | undefined;
    className?: string | undefined;
  }>
) {
  const [{ suggestedActionLayout }] = useStyleOptions();
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const [uiState] = useUIState();
  const classNames = useStyles(styles);

  return (
    <div
      aria-label={props['aria-label']}
      aria-orientation="vertical"
      className={cx(
        classNames['suggested-actions'],
        suggestedActionsStyleSet + '',
        {
          [classNames['suggested-actions--flow']]: suggestedActionLayout === 'flow',
          [classNames['suggested-actions--stacked']]: suggestedActionLayout !== 'flow'
        },
        props.className
      )}
      role="toolbar"
    >
      {uiState !== 'blueprint' && props.children}
    </div>
  );
}

function SuggestedActions() {
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const [suggestedActions, _, { activity }] = useSuggestedActionsHooks().useSuggestedActions();
  const focus = useFocus();

  const handleEscapeKey = useCallback(() => {
    focus('sendBox');
  }, [focus]);

  const children = isPreChatMessageActivity(activity)
    ? [] // Do not show suggested actions for pre-chat message, suggested actions has already shown inlined.
    : suggestedActions.map((cardAction, index) => {
        const { displayText, image, imageAltText, text, type, value } = cardAction as {
          displayText?: string;
          image?: string;
          imageAltText?: string;
          text?: string;
          type:
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
          value?: { [key: string]: any } | string;
        };

        if (!suggestedActions?.length) {
          return null;
        }

        return (
          <SuggestedAction
            buttonText={computeSuggestedActionText(cardAction)}
            displayText={displayText}
            image={image}
            // Image alt text should use `imageAltText` field and fallback to `text` field.
            // https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#image-alt-text
            imageAlt={image && (imageAltText || text)}
            itemIndex={index}
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            text={text}
            type={type}
            value={value}
          />
        );
      });

  return (
    <RovingFocusProvider onEscapeKey={handleEscapeKey}>
      <SuggestedActionStackedOrFlowContainer
        aria-label={localize('SUGGESTED_ACTIONS_LABEL_ALT')}
        className={classNames['suggested-actions']}
      >
        {children}
      </SuggestedActionStackedOrFlowContainer>
    </RovingFocusProvider>
  );
}

export default memo(SuggestedActions);
