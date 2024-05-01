import { hooks } from 'botframework-webchat-api';
import type { DirectLineCardAction } from 'botframework-webchat-core';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { type MouseEventHandler, useCallback } from 'react';

import useFocusVisible from '../hooks/internal/useFocusVisible';
import useLocalizeAccessKey from '../hooks/internal/useLocalizeAccessKey';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useSuggestedActionsAccessKey from '../hooks/internal/useSuggestedActionsAccessKey';
import useFocus from '../hooks/useFocus';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useStyleSet from '../hooks/useStyleSet';
import useItemRef from '../providers/RovingTabIndex/useItemRef';
import AccessibleButton from '../Utils/AccessibleButton';
import useFocusAccessKeyEffect from '../Utils/AccessKeySink/useFocusAccessKeyEffect';

const { useDirection, useDisabled, usePerformCardAction, useStyleOptions, useSuggestedActions } = hooks;

const ROOT_STYLE = {
  '&.webchat__suggested-action': {
    display: 'flex',
    overflow: 'hidden' // Prevent image from leaking; object-fit does not work with IE11
  }
};

type SuggestedActionProps = {
  buttonText: string;
  className?: string;
  displayText?: string;
  image?: string;
  imageAlt?: string;
  itemIndex: number;
  text?: string;
  textClassName?: string;
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
};

const SuggestedAction = ({
  buttonText,
  className,
  displayText,
  image,
  imageAlt,
  itemIndex,
  text,
  textClassName,
  type,
  value
}: SuggestedActionProps) => {
  const [_, setSuggestedActions] = useSuggestedActions();
  const [{ suggestedActionsStackedLayoutButtonTextWrap }] = useStyleOptions();
  const [{ suggestedAction: suggestedActionStyleSet }] = useStyleSet();
  const [accessKey] = useSuggestedActionsAccessKey();
  const [direction] = useDirection();
  const [disabled] = useDisabled();
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
        (className || '') + ''
      )}
      disabled={disabled}
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
      <span className={classNames('webchat__suggested-action__text', (textClassName || '') + '')}>{buttonText}</span>
      <div className="webchat__suggested-action__keyboard-focus-indicator" />
    </AccessibleButton>
  );
};

SuggestedAction.defaultProps = {
  className: '',
  displayText: '',
  image: '',
  imageAlt: undefined,
  text: '',
  textClassName: '',
  type: undefined,
  value: undefined
};

SuggestedAction.propTypes = {
  buttonText: PropTypes.string.isRequired,
  className: PropTypes.string,
  displayText: PropTypes.string,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  itemIndex: PropTypes.number.isRequired,
  text: PropTypes.string,
  textClassName: PropTypes.string,
  // TypeScript class is not mappable to PropTypes.
  // @ts-ignore
  type: PropTypes.string,
  value: PropTypes.any
};

export default SuggestedAction;
