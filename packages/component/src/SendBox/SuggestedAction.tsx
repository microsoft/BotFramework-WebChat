import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { MouseEventHandler, useCallback, useRef, VFC } from 'react';
import type { DirectLineCardAction } from 'botframework-webchat-core';

import AccessibleButton from '../Utils/AccessibleButton';
import connectToWebChat from '../connectToWebChat';
import useFocus from '../hooks/useFocus';
import useFocusAccessKeyEffect from '../Utils/AccessKeySink/useFocusAccessKeyEffect';
import useFocusVisible from '../hooks/internal/useFocusVisible';
import useLocalizeAccessKey from '../hooks/internal/useLocalizeAccessKey';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useSuggestedActionsAccessKey from '../hooks/internal/useSuggestedActionsAccessKey';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const { useDirection, useDisabled, usePerformCardAction, useStyleOptions, useSuggestedActions } = hooks;

const ROOT_STYLE = {
  '&.webchat__suggested-action': {
    display: 'flex',
    overflow: 'hidden' // Prevent image from leaking; object-fit does not work with IE11
  }
};

const connectSuggestedAction = (...selectors) =>
  connectToWebChat(
    ({ clearSuggestedActions, disabled, language, onCardAction }, { displayText, text, type, value }) => ({
      click: () => {
        onCardAction({ displayText, text, type, value });
        type === 'openUrl' && clearSuggestedActions();
      },
      disabled,
      language
    }),
    ...selectors
  );

type SuggestedActionProps = {
  buttonText: string;
  className?: string;
  displayText?: string;
  image?: string;
  imageAlt?: string;
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

const SuggestedAction: VFC<SuggestedActionProps> = ({
  buttonText,
  className,
  displayText,
  image,
  imageAlt,
  text,
  textClassName,
  type,
  value
}) => {
  const [_, setSuggestedActions] = useSuggestedActions();
  const [{ suggestedActionsStackedLayoutButtonTextWrap }] = useStyleOptions();
  const [{ suggestedAction: suggestedActionStyleSet }] = useStyleSet();
  const [accessKey] = useSuggestedActionsAccessKey();
  const [direction] = useDirection();
  const [disabled] = useDisabled();
  const focus = useFocus();
  const focusRef = useRef();
  const localizeAccessKey = useLocalizeAccessKey();
  const performCardAction = usePerformCardAction();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const scrollToEnd = useScrollToEnd();

  const [focusVisible] = useFocusVisible(focusRef);

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    ({ target }) => {
      // TODO: [P3] #XXX We should not destruct DirectLineCardAction into React props and pass them in. It makes typings difficult.
      //       Instead, we should pass a "cardAction" props.
      performCardAction({ displayText, text, type, value } as DirectLineCardAction, { target });

      // Since "openUrl" action do not submit, the suggested action buttons do not hide after click.
      type === 'openUrl' && setSuggestedActions([]);

      focus('sendBoxWithoutKeyboard');
      scrollToEnd();
    },
    [displayText, focus, performCardAction, scrollToEnd, setSuggestedActions, text, type, value]
  );

  useFocusAccessKeyEffect(accessKey, focusRef);

  return (
    <AccessibleButton
      {...(accessKey ? { 'aria-keyshortcuts': localizeAccessKey(accessKey) } : {})}
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
  text: PropTypes.string,
  textClassName: PropTypes.string,
  // TypeScript class is not mappable to PropTypes.
  // @ts-ignore
  type: PropTypes.string,
  value: PropTypes.any
};

export default SuggestedAction;

export { connectSuggestedAction };
