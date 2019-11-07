/* eslint react/no-array-index-key: "off" */

import BasicFilm from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import SuggestedAction from './SuggestedAction';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

function suggestedActionText({ displayText, title, type, value }) {
  if (type === 'messageBack') {
    return title || displayText;
  } else if (title) {
    return title;
  } else if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

const connectSuggestedActions = (...selectors) =>
  connectToWebChat(
    ({ language, suggestedActions }) => ({
      language,
      suggestedActions
    }),
    ...selectors
  );

const SuggestedActions = ({ className, suggestedActions = [] }) => {
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const [{ suggestedActionsStyleSet: suggestedActionsStyleSetForReactFilm }] = useStyleOptions();

  return (
    !!suggestedActions.length && (
      <BasicFilm
        autoCenter={false}
        className={classNames(suggestedActionsStyleSet + '', className + '')}
        showDots={false}
        styleSet={suggestedActionsStyleSetForReactFilm}
      >
        {suggestedActions.map(({ displayText, image, text, title, type, value }, index) => (
          <SuggestedAction
            buttonText={suggestedActionText({ displayText, title, type, value })}
            displayText={displayText}
            image={image}
            key={index}
            text={text}
            type={type}
            value={value}
          />
        ))}
      </BasicFilm>
    )
  );
};

SuggestedActions.defaultProps = {
  className: ''
};

SuggestedActions.propTypes = {
  className: PropTypes.string,
  suggestedActions: PropTypes.arrayOf(
    PropTypes.shape({
      displayText: PropTypes.string,
      image: PropTypes.string,
      text: PropTypes.string,
      title: PropTypes.string,
      type: PropTypes.string.isRequired,
      value: PropTypes.any
    })
  ).isRequired
};

export default connectSuggestedActions()(SuggestedActions);

export { connectSuggestedActions };
