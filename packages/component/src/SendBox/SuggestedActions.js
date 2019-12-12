/* eslint react/no-array-index-key: "off" */

import { css } from 'glamor';
import BasicFilm from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import SuggestedAction from './SuggestedAction';
import useLocalize from '../hooks/useLocalize';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

const SUGGESTED_ACTION_STACKED_CSS = css({
  display: 'flex',
  flexDirection: 'column'
});

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
  const [{ suggestedActionLayout, suggestedActionsStyleSet: suggestedActionsStyleSetForReactFilm }] = useStyleOptions();

  const suggestedActionsContentText = useLocalize('SuggestedActionsContent');
  const suggestedActionsEmptyText = useLocalize('SuggestedActionsEmpty');
  const suggestedActionsContainerText =
    useLocalize('SuggestedActionsContainer') +
    (suggestedActions.length ? suggestedActionsContentText : suggestedActionsEmptyText);

  const children = suggestedActions.map(({ displayText, image, text, title, type, value }, index) => (
    <SuggestedAction
      ariaHidden={true}
      buttonText={suggestedActionText({ displayText, title, type, value })}
      displayText={displayText}
      image={image}
      key={index}
      text={text}
      type={type}
      value={value}
    />
  ));

  const renderSuggestedActionsEmpty = useCallback(() => <ScreenReaderText text={suggestedActionsContainerText} />, [
    suggestedActionsContainerText
  ]);

  const renderSuggestedActionsStacked = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={suggestedActionsContainerText} />
        <div className={classNames(suggestedActionsStyleSet + '', SUGGESTED_ACTION_STACKED_CSS + '', className + '')}>
          {children}
        </div>
      </React.Fragment>
    ),
    [children, className, suggestedActions, suggestedActionsContainerText, suggestedActionsStyleSet]
  );

  const renderSuggestedActionsContent = useCallback(
    () => (
      <React.Fragment>
        <ScreenReaderText text={suggestedActionsContainerText} />
        <BasicFilm
          autoCenter={false}
          className={classNames(suggestedActionsStyleSet + '', className + '')}
          showDots={false}
          styleSet={suggestedActionsStyleSetForReactFilm}
        >
          {children}
        </BasicFilm>
      </React.Fragment>
    ),
    [
      children,
      className,
      suggestedActions,
      suggestedActionsContainerText,
      suggestedActionsStyleSet,
      suggestedActionsStyleSetForReactFilm
    ]
  );

  const renderSuggestedActionsContainer = useCallback(() => {
    if (!suggestedActions.length) {
      return renderSuggestedActionsEmpty();
    } else if (suggestedActionLayout === 'stacked') {
      return renderSuggestedActionsStacked();
    }
    return renderSuggestedActionsContent();
  }, [
    renderSuggestedActionsContent,
    renderSuggestedActionsEmpty,
    renderSuggestedActionsStacked,
    suggestedActionLayout,
    suggestedActions
  ]);

  return (
    // aria-live is implicitly set to polite when role="status"
    <div aria-label=" " role="status">
      {renderSuggestedActionsContainer()}
    </div>
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
