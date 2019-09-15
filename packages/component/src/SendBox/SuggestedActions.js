/* eslint react/no-array-index-key: "off" */

import BasicFilm from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import SuggestedAction from './SuggestedAction';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';
import useSuggestedActions from '../hooks/useSuggestedActions';

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

const connectSuggestedActions = (...selectors) => {
  console.warn(
    'Web Chat: connectSuggestedActions() will be removed on or after 2021-09-27, please use useSuggestedActions() instead.'
  );

  return connectToWebChat(
    ({ language, suggestedActions }) => ({
      language,
      suggestedActions
    }),
    ...selectors
  );
};

const SuggestedActions = ({ className }) => {
  const [suggestedActions] = useSuggestedActions();

  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const [{ suggestedActionsStyleSet: suggestedActionsStyleSetForBasicFilm }] = useStyleOptions();

  return (
    !!suggestedActions.length && (
      <BasicFilm
        autoCenter={false}
        className={classNames(suggestedActionsStyleSet + '', className + '')}
        showDots={false}
        styleSet={suggestedActionsStyleSetForBasicFilm}
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
  className: PropTypes.string
};

export default SuggestedActions;

export { connectSuggestedActions };
