import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';

import AccessibleButton from '../Utils/AccessibleButton';
import connectToWebChat from '../connectToWebChat';
import useFocus from '../hooks/useFocus';
import useFocusAccessKeyEffect from '../Utils/AccessKeySink/useFocusAccessKeyEffect';
import useLocalizeAccessKey from '../hooks/internal/useLocalizeAccessKey';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useSuggestedActionsAccessKey from '../hooks/internal/useSuggestedActionsAccessKey';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const { useDirection, useDisabled, usePerformCardAction, useStyleOptions, useSuggestedActions } = hooks;

const ROOT_STYLE = {
  '&.webchat__suggested-action': {
    '& .webchat__suggested-action__button': {
      display: 'flex',
      overflow: 'hidden' // Prevent image from leaking; object-fit does not work with IE11
    }
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

const SuggestedAction = ({ buttonText, className, displayText, image, imageAlt, text, textClassName, type, value }) => {
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

  const handleClick = useCallback(
    ({ target }) => {
      performCardAction({ displayText, text, type, value }, { target });

      // Since "openUrl" action do not submit, the suggested action buttons do not hide after click.
      type === 'openUrl' && setSuggestedActions([]);

      focus('sendBoxWithoutKeyboard');
      scrollToEnd();
    },
    [displayText, focus, performCardAction, scrollToEnd, setSuggestedActions, text, type, value]
  );

  useFocusAccessKeyEffect(accessKey, focusRef);

  return (
    <div
      className={classNames(
        'webchat__suggested-action',
        { 'webchat__suggested-action--rtl': direction === 'rtl' },
        rootClassName,
        suggestedActionStyleSet + '',
        (className || '') + ''
      )}
    >
      <AccessibleButton
        {...(accessKey ? { 'aria-keyshortcuts': localizeAccessKey(accessKey) } : {})}
        className={classNames('webchat__suggested-action__button', {
          'webchat__suggested-action--wrapping': suggestedActionsStackedLayoutButtonTextWrap
        })}
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
      </AccessibleButton>
    </div>
  );
};

SuggestedAction.defaultProps = {
  className: '',
  displayText: '',
  image: '',
  imageAlt: undefined,
  text: '',
  textClassName: '',
  type: '',
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
  type: PropTypes.string,
  value: PropTypes.any
};

export default SuggestedAction;

export { connectSuggestedAction };
