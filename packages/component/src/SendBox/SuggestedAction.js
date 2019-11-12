import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import connectToWebChat from '../connectToWebChat';
import useDisabled from '../hooks/useDisabled';
import usePerformCardAction from '../hooks/usePerformCardAction';
import useStyleSet from '../hooks/useStyleSet';

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

const SuggestedAction = ({ buttonText, clearSuggestedActions, disabled, displayText, image, text, type, value }) => {
  const [{ suggestedAction: suggestedActionStyleSet }] = useStyleSet();
  const [disabled] = useDisabled();
  const performCardAction = usePerformCardAction();

  const handleClick = useCallback(() => {
    performCardAction({ displayText, text, type, value });
    type === 'openUrl' && clearSuggestedActions();

    // TODO: Use the following line when setSuggestedActions hook is merged
    // type === 'openUrl' && setSuggestedActions([]);
  }, [clearSuggestedActions, displayText, performCardAction, text, type, value]);

  return (
    <div className={classNames(suggestedActionStyleSet + '', SUGGESTED_ACTION_CSS + '')}>
      <button disabled={disabled} onClick={handleClick} type="button">
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
  clearSuggestedActions: PropTypes.func.isRequired,
  displayText: PropTypes.string,
  image: PropTypes.string,
  text: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.any
};

export default connectSuggestedAction(({ clearSuggestedActions }) => ({ clearSuggestedActions }))(SuggestedAction);

export { connectSuggestedAction };
