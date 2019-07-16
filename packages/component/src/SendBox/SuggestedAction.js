import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

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

const SuggestedAction = ({ buttonText, click, disabled, image, styleSet }) => (
  <div className={classNames(styleSet.suggestedAction + '', SUGGESTED_ACTION_CSS + '')}>
    <button disabled={disabled} onClick={click} type="button">
      {image && <img src={image} />}
      <nobr>{buttonText}</nobr>
    </button>
  </div>
);

SuggestedAction.defaultProps = {
  disabled: false,
  image: ''
};

SuggestedAction.propTypes = {
  buttonText: PropTypes.string.isRequired,
  click: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  image: PropTypes.string,
  styleSet: PropTypes.shape({
    suggestedAction: PropTypes.any.isRequired
  }).isRequired
};

export default connectSuggestedAction(({ styleSet }) => ({ styleSet }))(SuggestedAction);

export { connectSuggestedAction };
