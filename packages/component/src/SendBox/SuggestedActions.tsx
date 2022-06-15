/* eslint react/no-array-index-key: "off" */

import { hooks } from 'botframework-webchat-api';
import BasicFilm, { createBasicStyleSet as createBasicStyleSetForReactFilm } from 'react-film';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC, useMemo, useRef } from 'react';
import type { DirectLineCardAction } from 'botframework-webchat-core';

import computeSuggestedActionText from '../Utils/computeSuggestedActionText';
import connectToWebChat from '../connectToWebChat';
import RovingTabIndexComposer from '../providers/RovingTabIndex/RovingTabIndexComposer';
import ScreenReaderText from '../ScreenReaderText';
import SuggestedAction from './SuggestedAction';
import useFocusWithin from '../hooks/internal/useFocusWithin';
import useNonce from '../hooks/internal/useNonce';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
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
  const ref = useRef();
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

  const [focusedWithin] = useFocusWithin(ref);

  return (
    // TODO: The content of suggested actions should be the labelled by the activity.
    //       That means, when the user focus into the suggested actions, it should read similar to "Bot said, what's your preference of today? Suggested actions has items: apple button, orange button, banana button."
    <div
      aria-labelledby={ariaLabelId}
      className={classNames(
        'webchat__suggested-actions',
        'webchat__suggested-actions--carousel-layout',
        {
          'webchat__suggested-actions--focus-within': focusedWithin,
          'webchat__suggested-actions--rtl': direction === 'rtl'
        },
        rootClassName,
        suggestedActionsStyleSet + '',
        (className || '') + ''
      )}
      ref={ref}
      role="toolbar"
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
      <div className="webchat__suggested-actions__focus-indicator" />
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
      role="toolbar"
    >
      <ScreenReaderText id={ariaLabelId} text={screenReaderText} />
      {!!children && !!React.Children.count(children) && (
        <div className="webchat__suggested-actions__flow-box">
          {React.Children.map(children, child => (
            <div className="webchat__suggested-actions__flow-item-box">{child}</div>
          ))}
        </div>
      )}
      <div className="webchat__suggested-actions__focus-indicator" />
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
      role="toolbar"
    >
      <ScreenReaderText id={ariaLabelId} text={screenReaderText} />
      {!!children && !!React.Children.count(children) && (
        <div className="webchat__suggested-actions__stack">{children}</div>
      )}
      <div className="webchat__suggested-actions__focus-indicator" />
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
  const localize = useLocalizer();

  // TODO: [P1] Clean up this one so screen reader will narrate something similar to "suggested actions toolbar".
  const screenReaderText = localize('SUGGESTED_ACTIONS_ALT', '');

  const children = suggestedActions.map((cardAction, index) => {
    const { displayText, image, imageAltText, text, type, value } = cardAction as {
      displayText?: string;
      image?: string;
      imageAltText?: string;
      text?: string;
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
          buttonText={computeSuggestedActionText(cardAction)}
          className="webchat__suggested-actions__button"
          displayText={displayText}
          image={image}
          imageAlt={imageAltText}
          itemIndex={index}
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

  // If there are no suggested actions, we will render nothing.
  if (!children.length) {
    return null;
  }

  if (suggestedActionLayout === 'flow') {
    return (
      <RovingTabIndexComposer>
        <SuggestedActionFlowContainer className={className} screenReaderText={screenReaderText}>
          {children}
        </SuggestedActionFlowContainer>
      </RovingTabIndexComposer>
    );
  } else if (suggestedActionLayout === 'stacked') {
    return (
      <RovingTabIndexComposer direction="vertical">
        <SuggestedActionStackedContainer className={className} screenReaderText={screenReaderText}>
          {children}
        </SuggestedActionStackedContainer>
      </RovingTabIndexComposer>
    );
  }

  return (
    <RovingTabIndexComposer>
      <SuggestedActionCarouselContainer className={className} screenReaderText={screenReaderText}>
        {children}
      </SuggestedActionCarouselContainer>
    </RovingTabIndexComposer>
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
