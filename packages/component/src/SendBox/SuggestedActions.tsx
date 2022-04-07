/* eslint react/no-array-index-key: "off" */

import { hooks } from 'botframework-webchat-api';
import BasicFilm, { createBasicStyleSet as createBasicStyleSetForReactFilm } from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC, useMemo, useRef } from 'react';
import type { DirectLineCardAction } from 'botframework-webchat-core';

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
  '&.webchat__suggested-actions': {
    '&.webchat__suggested-actions--flow-layout .webchat__suggested-actions__flow-box': {
      display: 'flex',
      flexWrap: 'wrap'
    },

    '&.webchat__suggested-actions--stack-layout .webchat__suggested-actions__stack': {
      display: 'flex',
      flexDirection: 'column'
    }
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

const SuggestedActionCarouselContainer = ({ children, className, screenReaderText }) => {
  const [
    {
      suggestedActionsCarouselFlipperBoxWidth,
      suggestedActionsCarouselFlipperCursor,
      suggestedActionsCarouselFlipperSize
    }
  ] = useStyleOptions();
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const [nonce] = useNonce();
  const ariaLabelId = useUniqueId('webchat__suggested-actions');
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const filmStyleSet = useMemo(
    () =>
      createBasicStyleSetForReactFilm({
        autoHide: false,
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

  return (
    // TODO: The content of suggested actions should be the labelled by the activity.
    //       That means, when the user focus into the suggested actions, it should read similar to "Bot said, what's your preference of today? Suggested actions has items: apple button, orange button, banana button."
    <div
      aria-labelledby={ariaLabelId}
      aria-live="polite"
      className={classNames(
        'webchat__suggested-actions',
        'webchat__suggested-actions--carousel-layout',
        { 'webchat__suggested-actions--rtl': direction === 'rtl' },
        rootClassName,
        suggestedActionsStyleSet + '',
        (className || '') + ''
      )}
      role="status"
    >
      <ScreenReaderText id={ariaLabelId} text={screenReaderText} />
      {!!children && !!React.Children.count(children) && (
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
      )}
    </div>
  );
};

SuggestedActionCarouselContainer.defaultProps = {
  children: undefined,
  className: undefined
};

SuggestedActionCarouselContainer.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  screenReaderText: PropTypes.string.isRequired
};

const SuggestedActionFlowContainer = ({ children, className, screenReaderText }) => {
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const ariaLabelId = useUniqueId('webchat__suggested-actions');
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      aria-labelledby={ariaLabelId}
      aria-live="polite"
      className={classNames(
        'webchat__suggested-actions',
        'webchat__suggested-actions--flow-layout',
        rootClassName,
        suggestedActionsStyleSet + '',
        (className || '') + ''
      )}
      role="status"
    >
      <ScreenReaderText id={ariaLabelId} text={screenReaderText} />
      {!!children && !!React.Children.count(children) && (
        <div className="webchat__suggested-actions__flow-box">
          {React.Children.map(children, child => (
            <div className="webchat__suggested-actions__flow-item-box">{child}</div>
          ))}
        </div>
      )}
    </div>
  );
};

SuggestedActionFlowContainer.defaultProps = {
  children: undefined,
  className: undefined
};

SuggestedActionFlowContainer.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  screenReaderText: PropTypes.string.isRequired
};

const SuggestedActionStackedContainer = ({ children, className, screenReaderText }) => {
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const ariaLabelId = useUniqueId('webchat__suggested-actions');
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      aria-labelledby={ariaLabelId}
      aria-live="polite"
      className={classNames(
        'webchat__suggested-actions',
        'webchat__suggested-actions--stacked-layout',
        rootClassName,
        suggestedActionsStyleSet + '',
        (className || '') + ''
      )}
      role="status"
    >
      <ScreenReaderText id={ariaLabelId} text={screenReaderText} />
      {!!children && !!React.Children.count(children) && (
        <div className="webchat__suggested-actions__stack">{children}</div>
      )}
    </div>
  );
};

SuggestedActionStackedContainer.defaultProps = {
  children: undefined,
  className: undefined
};

SuggestedActionStackedContainer.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  screenReaderText: PropTypes.string.isRequired
};

type SuggestedActionsProps = {
  className?: string;
  suggestedActions?: DirectLineCardAction[];
};

const SuggestedActions: FC<SuggestedActionsProps> = ({ className, suggestedActions = [] }) => {
  const [{ suggestedActionLayout, suggestedActionsStackedLayoutButtonTextWrap }] = useStyleOptions();
  const [accessKey] = useSuggestedActionsAccessKey();
  const hideEmptyRef = useRef(true);
  const localize = useLocalizer();
  const localizeAccessKey = useLocalizeAccessKey();

  const screenReaderText = localize(
    'SUGGESTED_ACTIONS_ALT',
    suggestedActions.length
      ? accessKey
        ? localize('SUGGESTED_ACTIONS_ALT_HAS_CONTENT_AND_ACCESS_KEY', localizeAccessKey(accessKey))
        : localize('SUGGESTED_ACTIONS_ALT_HAS_CONTENT')
      : localize('SUGGESTED_ACTIONS_ALT_NO_CONTENT')
  );

  const children = suggestedActions.map((cardAction, index) => {
    const { displayText, image, imageAltText, text, title, type, value } = cardAction as {
      displayText?: string;
      image?: string;
      imageAltText?: string;
      text?: string;
      title?: string;
      type:
        | 'call'
        | 'downloadFile'
        | 'imBack'
        | 'messageBack'
        | 'openUrl'
        | 'playAudio'
        | 'playVideo'
        | 'postBack'
        | 'showImage'
        | 'signin';
      value?: { [key: string]: any } | string;
    };

    return (
      <div className="webchat__suggested-actions__item-box" key={index}>
        <SuggestedAction
          buttonText={suggestedActionText({ displayText, title, type, value })}
          className="webchat__suggested-actions__button"
          displayText={displayText}
          image={image}
          imageAlt={imageAltText}
          text={text}
          textClassName={
            suggestedActionLayout === 'stacked' && suggestedActionsStackedLayoutButtonTextWrap
              ? 'webchat__suggested-actions__button-text-stacked-text-wrap'
              : 'webchat__suggested-actions__button-text'
          }
          type={type}
          value={value}
        />
      </div>
    );
  });

  // (Related to #4021)
  //
  // To improve accessibility UX, if there are no suggested actions, and this container was never shown.
  // Then, avoid rendering the alt-text "Suggested Actions Container: Is empty".
  //
  // This is to reduce the narration of "Is empty".
  //
  // After any suggested actions were shown during the lifetime of this container, then we will
  // continue to start showing "Suggested Actions Container: Is empty" when the container is empty.
  if (!children.length && hideEmptyRef.current) {
    return null;
  }

  // Otherwise, if we have rendered once, we will continue to render "Is empty".
  hideEmptyRef.current = false;

  if (suggestedActionLayout === 'flow') {
    return (
      <SuggestedActionFlowContainer className={className} screenReaderText={screenReaderText}>
        {children}
      </SuggestedActionFlowContainer>
    );
  } else if (suggestedActionLayout === 'stacked') {
    return (
      <SuggestedActionStackedContainer className={className} screenReaderText={screenReaderText}>
        {children}
      </SuggestedActionStackedContainer>
    );
  }

  return (
    <SuggestedActionCarouselContainer className={className} screenReaderText={screenReaderText}>
      {children}
    </SuggestedActionCarouselContainer>
  );
};

SuggestedActions.defaultProps = {
  className: ''
};

SuggestedActions.propTypes = {
  className: PropTypes.string,

  // TypeScript class is not mappable to PropTypes.func
  // @ts-ignore
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
