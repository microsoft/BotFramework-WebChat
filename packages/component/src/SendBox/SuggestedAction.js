import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import connectToWebChat from '../connectToWebChat';
import useStyleSet from '../hooks/useStyleSet';
import useWebChat from '../useWebChat';

const SUGGESTED_ACTION_CSS = css({
  display: 'inline-block',
  whiteSpace: 'initial',

  '& > button': {
    display: 'flex'
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

const useSuggestedAction = () => {
  const { clearSuggestedActions, disabled, onCardAction } = useWebChat(state => state);

  return {
    clearSuggestedActions,
    disabled,
    onCardAction
  };
};

const SuggestedAction = ({ buttonText, displayText, image, text, type, value }) => {
  const { clearSuggestedActions, disabled, onCardAction } = useSuggestedAction();
  const styleSet = useStyleSet();
  const click = useCallback(() => {
    onCardAction({ displayText, text, type, value });
    type === 'openUrl' && clearSuggestedActions();
  }, [clearSuggestedActions, onCardAction, displayText, text, type, value]);

  return (
    <div className={classNames(styleSet.suggestedAction + '', SUGGESTED_ACTION_CSS + '')}>
      <button disabled={disabled} onClick={click} type="button">
        {image && <img src={image} />}
        <nobr>{buttonText}</nobr>
      </button>
    </div>
  );
};

SuggestedAction.defaultProps = {
  displayText: '',
  image: '',
  text: '',
  type: '',
  value: undefined
};

SuggestedAction.propTypes = {
  buttonText: PropTypes.string.isRequired,
  displayText: PropTypes.string,
  image: PropTypes.string,
  text: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.any
};

export default SuggestedAction;

export { connectSuggestedAction };
