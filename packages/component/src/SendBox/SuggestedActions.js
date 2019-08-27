/* eslint react/no-array-index-key: "off" */

import BasicFilm from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import SuggestedAction from './SuggestedAction';
import useStyleSet from '../hooks/useStyleSet';
import useWebChat from '../useWebChat';

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

const useSuggestedActions = () => {
  const { suggestedActions = [] } = useWebChat(state => state);

  return { suggestedActions };
};

const SuggestedActions = ({ className }) => {
  const { suggestedActions } = useSuggestedActions();
  const styleSet = useStyleSet();

  return (
    !!suggestedActions.length && (
      <BasicFilm
        autoCenter={false}
        className={classNames(styleSet.suggestedActions + '', className + '')}
        showDots={false}
        styleSet={styleSet.options.suggestedActionsStyleSet}
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

export { connectSuggestedActions, useSuggestedActions };
