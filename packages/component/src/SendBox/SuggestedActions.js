/* eslint react/no-array-index-key: "off" */

import { hooks } from 'botframework-webchat-api';
import BasicFilm, { createBasicStyleSet as createBasicStyleSetForReactFilm } from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import connectToWebChat from '../connectToWebChat';
import ScreenReaderText from '../ScreenReaderText';
import SuggestedAction from './SuggestedAction';
import useLocalizeAccessKey from '../hooks/internal/useLocalizeAccessKey';
import useNonce from '../hooks/internal/useNonce';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useSuggestedActionsAccessKey from '../hooks/internal/useSuggestedActionsAccessKey';
import useUniqueId from '../hooks/internal/useUniqueId';

const { useDirection, useLocalizer, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__suggested-actions .webchat__suggested-actions__stack': {
    display: 'flex',
    flexDirection: 'column'
  }
};

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
  const [
    {
      suggestedActionLayout,
      suggestedActionsCarouselFlipperBoxWidth,
      suggestedActionsCarouselFlipperCursor,
      suggestedActionsCarouselFlipperSize
    }
  ] = useStyleOptions();
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const [accessKey] = useSuggestedActionsAccessKey();
  const [direction] = useDirection();
  const [nonce] = useNonce();
  const ariaLabelId = useUniqueId('webchat__suggested-actions');
  const localize = useLocalizer();
  const localizeAccessKey = useLocalizeAccessKey();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const filmStyleSet = useMemo(
    () =>
      createBasicStyleSetForReactFilm({
        cursor: suggestedActionsCarouselFlipperCursor,
        flipperBoxWidth: suggestedActionsCarouselFlipperBoxWidth,
        flipperSize: suggestedActionsCarouselFlipperSize
      }),
    [
      suggestedActionsCarouselFlipperBoxWidth,
      suggestedActionsCarouselFlipperCursor,
      suggestedActionsCarouselFlipperSize
    ]
  );

  const suggestedActionsContainerText = localize(
    'SUGGESTED_ACTIONS_ALT',
    suggestedActions.length
      ? accessKey
        ? localize('SUGGESTED_ACTIONS_ALT_HAS_CONTENT_AND_ACCESS_KEY', localizeAccessKey(accessKey))
        : localize('SUGGESTED_ACTIONS_ALT_HAS_CONTENT')
      : localize('SUGGESTED_ACTIONS_ALT_NO_CONTENT')
  );

  if (!suggestedActions.length) {
    return (
      <div aria-labelledby={ariaLabelId} aria-live="polite" role="status">
        <ScreenReaderText id={ariaLabelId} text={suggestedActionsContainerText} />
      </div>
    );
  }

  const children = suggestedActions.map(({ displayText, image, imageAltText, text, title, type, value }, index) => (
    <SuggestedAction
      ariaHidden={true}
      buttonText={suggestedActionText({ displayText, title, type, value })}
      displayText={displayText}
      image={image}
      imageAlt={imageAltText}
      key={index}
      text={text}
      type={type}
      value={value}
    />
  ));

  if (suggestedActionLayout === 'stacked') {
    return (
      <div
        aria-labelledby={ariaLabelId}
        aria-live="polite"
        className={classNames(
          'webchat__suggested-actions',
          rootClassName,
          suggestedActionsStyleSet + '',
          (className || '') + ''
        )}
        role="status"
      >
        <ScreenReaderText id={ariaLabelId} text={suggestedActionsContainerText} />
        <div className="webchat__suggested-actions__stack">{children}</div>
      </div>
    );
  }

  return (
    // TODO: The content of suggested actions should be the labelled by the activity.
    //       That means, when the user focus into the suggested actions, it should read similar to "Bot said, what's your preference of today? Suggested actions has items: apple button, orange button, banana button."
    <div
      aria-labelledby={ariaLabelId}
      aria-live="polite"
      className={classNames(
        'webchat__suggested-actions',
        rootClassName,
        suggestedActionsStyleSet + '',
        (className || '') + ''
      )}
      role="status"
    >
      <ScreenReaderText id={ariaLabelId} text={suggestedActionsContainerText} />
      <BasicFilm
        autoCenter={false}
        className="webchat__suggested-actions__carousel"
        dir={direction}
        flipperBlurFocusOnClick={true}
        nonce={nonce}
        showDots={false}
        showScrollBar={false}
        styleSet={filmStyleSet}
      >
        {children}
      </BasicFilm>
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
      imageAltText: PropTypes.string,
      text: PropTypes.string,
      title: PropTypes.string,
      type: PropTypes.string.isRequired,
      value: PropTypes.any
    })
  ).isRequired
};

export default connectSuggestedActions()(SuggestedActions);

export { connectSuggestedActions };
