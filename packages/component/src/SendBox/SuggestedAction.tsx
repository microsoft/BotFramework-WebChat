import { hooks } from 'botframework-webchat-api';
import { type DirectLineCardAction } from 'botframework-webchat-core';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { memo, useCallback, type MouseEventHandler } from 'react';
import { any, literal, number, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useFocusVisible from '../hooks/internal/useFocusVisible';
import useLocalizeAccessKey from '../hooks/internal/useLocalizeAccessKey';
import useSuggestedActionsAccessKey from '../hooks/internal/useSuggestedActionsAccessKey';
import useFocus from '../hooks/useFocus';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useStyleSet from '../hooks/useStyleSet';
import useItemRef from '../providers/RovingTabIndex/useItemRef';
import testIds from '../testIds';
import AccessibleButton from '../Utils/AccessibleButton';
import useFocusAccessKeyEffect from '../Utils/AccessKeySink/useFocusAccessKeyEffect';

const { useDirection, usePerformCardAction, useStyleOptions, useSuggestedActionsHooks, useUIState } = hooks;

const ROOT_STYLE = {
  '&.webchat__suggested-action': {
    display: 'flex',
    overflow: 'hidden' // Prevent image from leaking; object-fit does not work with IE11
  }
};

const suggestedActionPropsSchema = pipe(
  object({
    buttonText: string(),
    className: optional(string()),
    displayText: optional(string()),
    image: optional(string()),
    imageAlt: optional(string()),
    itemIndex: number(),
    text: optional(string()),
    textClassName: optional(string()),
    type: optional(
      union([
        literal('call'),
        literal('downloadFile'),
        literal('imBack'),
        literal('messageBack'),
        literal('openUrl'),
        literal('playAudio'),
        literal('playVideo'),
        literal('postBack'),
        literal('showImage'),
        literal('signin')
      ])
    ),
    value: any()
  }),
  readonly()
);

type SuggestedActionProps = InferInput<typeof suggestedActionPropsSchema>;

function SuggestedAction(props: SuggestedActionProps) {
  const {
    buttonText,
    className,
    displayText = '',
    image = '',
    imageAlt,
    itemIndex,
    text = '',
    textClassName,
    type,
    value
  } = validateProps(suggestedActionPropsSchema, props);

  const [_, setSuggestedActions] = useSuggestedActionsHooks().useSuggestedActions();
  const [{ suggestedActionsStackedLayoutButtonTextWrap }] = useStyleOptions();
  const [{ suggestedAction: suggestedActionStyleSet }] = useStyleSet();
  const [accessKey] = useSuggestedActionsAccessKey();
  const [direction] = useDirection();
  const [uiState] = useUIState();
  const focus = useFocus();
  const focusRef = useItemRef<HTMLButtonElement>(itemIndex);
  const localizeAccessKeyAsAriaKeyShortcuts = useLocalizeAccessKey('aria-keyshortcuts');
  const performCardAction = usePerformCardAction();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const scrollToEnd = useScrollToEnd();

  const [focusVisible] = useFocusVisible(focusRef);

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

  useFocusAccessKeyEffect(accessKey, focusRef);

  return (
    <AccessibleButton
      {...(accessKey ? { 'aria-keyshortcuts': localizeAccessKeyAsAriaKeyShortcuts(accessKey) } : {})}
      className={classNames(
        'webchat__suggested-action',
        {
          'webchat__suggested-action--focus-visible': focusVisible,
          'webchat__suggested-action--rtl': direction === 'rtl',
          'webchat__suggested-action--wrapping': suggestedActionsStackedLayoutButtonTextWrap
        },
        rootClassName,
        suggestedActionStyleSet + '',
        className
      )}
      data-testid={testIds.suggestedActionButton}
      disabled={uiState === 'disabled'}
      onClick={handleClick}
      ref={focusRef}
      type="button"
    >
      {image && (
        <img
          alt={imageAlt}
          className={classNames(
            'webchat__suggested-action__image',
            direction === 'rtl' && 'webchat__suggested-action__image--rtl'
          )}
          src={image}
        />
      )}
      <span className={classNames('webchat__suggested-action__text', textClassName)}>{buttonText}</span>
      <div className="webchat__suggested-action__keyboard-focus-indicator" />
    </AccessibleButton>
  );
}

export default memo(SuggestedAction);
export { suggestedActionPropsSchema, type SuggestedActionProps };
