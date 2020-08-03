import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';

import AccessibleButton from '../Utils/AccessibleButton';
import connectToWebChat from '../connectToWebChat';
import useDirection from '../hooks/useDirection';
import useDisabled from '../hooks/useDisabled';
import useFocus from '../hooks/useFocus';
import useFocusAccessKeyEffect from '../Utils/AccessKeySink/useFocusAccessKeyEffect';
import useLocalizeAccessKey from '../hooks/internal/useLocalizeAccessKey';
import usePerformCardAction from '../hooks/usePerformCardAction';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useStyleSet from '../hooks/useStyleSet';
import useSuggestedActions from '../hooks/useSuggestedActions';
import useSuggestedActionsAccessKey from '../hooks/internal/useSuggestedActionsAccessKey';

const SUGGESTED_ACTION_CSS = css({
  '&.webchat__suggested-action': {
    display: 'flex',
    flexDirection: 'column',
    whiteSpace: 'initial',

    '& .webchat__suggested-action__button': {
      display: 'flex',
      overflow: 'hidden'
    }
  }
});

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

const SuggestedAction = ({
  'aria-hidden': ariaHidden,
  buttonText,
  displayText,
  image,
  imageAlt,
  text,
  type,
  value
}) => {
  const [_, setSuggestedActions] = useSuggestedActions();
  const [{ suggestedAction: suggestedActionStyleSet }] = useStyleSet();
  const [accessKey] = useSuggestedActionsAccessKey();
  const [direction] = useDirection();
  const [disabled] = useDisabled();
  const focus = useFocus();
  const focusRef = useRef();
  const localizeAccessKey = useLocalizeAccessKey();
  const performCardAction = usePerformCardAction();
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
      aria-hidden={ariaHidden}
      className={classNames(suggestedActionStyleSet + '', SUGGESTED_ACTION_CSS + '', 'webchat__suggested-action')}
    >
      <AccessibleButton
        {...(accessKey ? { 'aria-keyshortcuts': localizeAccessKey(accessKey) } : {})}
        className="webchat__suggested-action__button"
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
        <nobr className="webchat__suggested-action__button-text">{buttonText}</nobr>
      </AccessibleButton>
    </div>
  );
};

SuggestedAction.defaultProps = {
  'aria-hidden': false,
  displayText: '',
  image: '',
  imageAlt: undefined,
  text: '',
  type: '',
  value: undefined
};

SuggestedAction.propTypes = {
  'aria-hidden': PropTypes.bool,
  buttonText: PropTypes.string.isRequired,
  displayText: PropTypes.string,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  text: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.any
};

export default SuggestedAction;

export { connectSuggestedAction };
