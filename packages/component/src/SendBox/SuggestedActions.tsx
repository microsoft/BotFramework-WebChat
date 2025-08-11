/* eslint react/no-array-index-key: "off" */

import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';
import { createBasicStyleSet as createBasicStyleSetForReactFilm, ReactFilm } from 'react-film';

import computeSuggestedActionText from '../Utils/computeSuggestedActionText';
import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useFocusWithin from '../hooks/internal/useFocusWithin';
import useNonce from '../hooks/internal/useNonce';
import useFocus from '../hooks/useFocus';
import useStyleSet from '../hooks/useStyleSet';
import RovingTabIndexComposer from '../providers/RovingTabIndex/RovingTabIndexComposer';
import SuggestedAction from './SuggestedAction';

const { useDirection, useLocalizer, useStyleOptions, useSuggestedActionsHooks } = hooks;

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

const SuggestedActionCarouselContainer = ({ children, className, label }) => {
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
  const localize = useLocalizer();
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
  const nextFlipperAriaLabel = localize('SUGGESTED_ACTIONS_FLIPPER_NEXT_ALT');
  const previousFlipperAriaLabel = localize('SUGGESTED_ACTIONS_FLIPPER_PREVIOUS_ALT');

  const [focusedWithin] = useFocusWithin(ref);
  const leftFlipperAriaLabel = direction === 'rtl' ? nextFlipperAriaLabel : previousFlipperAriaLabel;
  const rightFlipperAriaLabel = direction === 'rtl' ? previousFlipperAriaLabel : nextFlipperAriaLabel;

  return (
    // TODO: The content of suggested actions should be the labelled by the activity.
    //       That means, when the user focus into the suggested actions, it should read similar to "Bot said, what's your preference of today? Suggested actions has items: apple button, orange button, banana button."
    <div
      aria-label={label}
      aria-orientation="horizontal"
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
      {!!children && !!React.Children.count(children) && (
        <ReactFilm
          autoCenter={false}
          className="webchat__suggested-actions__carousel"
          dir={direction}
          flipperBlurFocusOnClick={true}
          leftFlipperAriaLabel={leftFlipperAriaLabel}
          nonce={nonce}
          rightFlipperAriaLabel={rightFlipperAriaLabel}
          showDots={false}
          showScrollBar={false}
          styleSet={filmStyleSet}
        >
          {children}
        </ReactFilm>
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
  label: PropTypes.string.isRequired
};

const SuggestedActionFlowContainer = ({ children, className, label }) => {
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      aria-label={label}
      aria-orientation="horizontal"
      className={classNames(
        'webchat__suggested-actions',
        'webchat__suggested-actions--flow-layout',
        rootClassName,
        suggestedActionsStyleSet + '',
        (className || '') + ''
      )}
      role="toolbar"
    >
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
  label: PropTypes.string.isRequired
};

const SuggestedActionStackedContainer = ({ children, className, label }) => {
  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      aria-label={label}
      aria-orientation="vertical"
      className={classNames(
        'webchat__suggested-actions',
        'webchat__suggested-actions--stacked-layout',
        rootClassName,
        suggestedActionsStyleSet + '',
        (className || '') + ''
      )}
      role="toolbar"
    >
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
  label: PropTypes.string.isRequired
};

type SuggestedActionsProps = Readonly<{
  className?: string;
}>;

const SuggestedActions = ({ className }: SuggestedActionsProps) => {
  const [suggestedActions] = useSuggestedActionsHooks().useSuggestedActions();
  const [{ suggestedActionLayout, suggestedActionsStackedLayoutButtonTextWrap }] = useStyleOptions();
  const localize = useLocalizer();
  const focus = useFocus();

  const handleEscapeKey = useCallback(() => {
    focus('sendBox');
  }, [focus]);

  const label = localize('SUGGESTED_ACTIONS_LABEL_ALT');

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
          // Image alt text should use `imageAltText` field and fallback to `text` field.
          // https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#image-alt-text
          imageAlt={image && (imageAltText || text)}
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
      <RovingTabIndexComposer onEscapeKey={handleEscapeKey}>
        <SuggestedActionFlowContainer className={className} label={label}>
          {children}
        </SuggestedActionFlowContainer>
      </RovingTabIndexComposer>
    );
  } else if (suggestedActionLayout === 'stacked') {
    return (
      <RovingTabIndexComposer onEscapeKey={handleEscapeKey} orientation="vertical">
        <SuggestedActionStackedContainer className={className} label={label}>
          {children}
        </SuggestedActionStackedContainer>
      </RovingTabIndexComposer>
    );
  }

  return (
    <RovingTabIndexComposer onEscapeKey={handleEscapeKey}>
      <SuggestedActionCarouselContainer className={className} label={label}>
        {children}
      </SuggestedActionCarouselContainer>
    </RovingTabIndexComposer>
  );
};

export default SuggestedActions;
