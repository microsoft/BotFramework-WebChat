/* eslint react/no-array-index-key: "off" */

import {
  useCarouselItemContainerRef,
  useCarouselScrollableRef,
  useCarouselState
} from '@msinternal/botframework-webchat-component-carousel';
import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { Children, memo, useCallback, useRef } from 'react';
import { object, optional, pipe, readonly, string } from 'valibot';

import CarouselComposer from '../Carousel/CarouselComposer';
import CarouselFlipper from '../Carousel/CarouselFlipper';
import computeSuggestedActionText from '../Utils/computeSuggestedActionText';
import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useFocusWithin from '../hooks/internal/useFocusWithin';
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

const suggestedActionsContainerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    label: string()
  }),
  readonly()
);

type SuggestedActionsContainerProps = InferReactProps<typeof suggestedActionsContainerPropsSchema>;

const suggestedActionCarouselPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type SuggestedActionCarouselProps = InferReactProps<typeof suggestedActionCarouselPropsSchema>;

function SuggestedActionCarousel(props: SuggestedActionCarouselProps) {
  const { children } = validateProps(suggestedActionCarouselPropsSchema, props);

  const [{ atEnd, atStart, overflowing, scrolling }] = useCarouselState();
  const [direction] = useDirection();
  const itemContainerRef = useCarouselItemContainerRef();
  const localize = useLocalizer();
  const scrollableRef = useCarouselScrollableRef();

  // Unlike the attachment carousel, flippers are always shown: at the edge, they are disabled.
  // The `react-film__*` class names are deprecated and have no styles.
  return (
    <div className="webchat__suggested-actions__carousel" dir={direction}>
      <div
        className={classNames('webchat__suggested-actions__carousel-main', 'react-film__main', {
          'react-film__main--scrolling': scrolling
        })}
      >
        {overflowing && (
          <CarouselFlipper
            aria-label={localize('SUGGESTED_ACTIONS_FLIPPER_PREVIOUS_ALT')}
            atEdge={atStart}
            mode="previous"
          />
        )}
        <div
          className={classNames('webchat__suggested-actions__carousel-filmstrip', 'react-film__filmstrip')}
          ref={scrollableRef}
        >
          <ul
            className={classNames('webchat__suggested-actions__carousel-list', 'react-film__filmstrip__list')}
            ref={itemContainerRef}
          >
            {Children.map(children, child => (
              <li className={classNames('webchat__suggested-actions__carousel-item', 'react-film__filmstrip__item')}>
                {child}
              </li>
            ))}
          </ul>
        </div>
        {overflowing && (
          <CarouselFlipper aria-label={localize('SUGGESTED_ACTIONS_FLIPPER_NEXT_ALT')} atEdge={atEnd} mode="next" />
        )}
      </div>
    </div>
  );
}

SuggestedActionCarousel.displayName = 'SuggestedActionCarousel';

function SuggestedActionCarouselContainer(props: SuggestedActionsContainerProps) {
  const { children, className, label } = validateProps(suggestedActionsContainerPropsSchema, props);

  const [{ suggestedActions: suggestedActionsStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const ref = useRef<HTMLDivElement>(null);
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const [focusedWithin] = useFocusWithin(ref);

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
        className
      )}
      ref={ref}
      role="toolbar"
    >
      {!!Children.count(children) && (
        <CarouselComposer>
          <SuggestedActionCarousel>{children}</SuggestedActionCarousel>
        </CarouselComposer>
      )}
      <div className="webchat__suggested-actions__focus-indicator" />
    </div>
  );
}

SuggestedActionCarouselContainer.displayName = 'SuggestedActionCarouselContainer';

function SuggestedActionFlowContainer(props: SuggestedActionsContainerProps) {
  const { children, className, label } = validateProps(suggestedActionsContainerPropsSchema, props);

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
        className
      )}
      role="toolbar"
    >
      {!!Children.count(children) && (
        <div className="webchat__suggested-actions__flow-box">
          {Children.map(children, child => (
            <div className="webchat__suggested-actions__flow-item-box">{child}</div>
          ))}
        </div>
      )}
      <div className="webchat__suggested-actions__focus-indicator" />
    </div>
  );
}

SuggestedActionFlowContainer.displayName = 'SuggestedActionFlowContainer';

function SuggestedActionStackedContainer(props: SuggestedActionsContainerProps) {
  const { children, className, label } = validateProps(suggestedActionsContainerPropsSchema, props);

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
        className
      )}
      role="toolbar"
    >
      {!!Children.count(children) && <div className="webchat__suggested-actions__stack">{children}</div>}
      <div className="webchat__suggested-actions__focus-indicator" />
    </div>
  );
}

SuggestedActionStackedContainer.displayName = 'SuggestedActionStackedContainer';

const suggestedActionsPropsSchema = pipe(
  object({
    className: optional(string())
  }),
  readonly()
);

type SuggestedActionsProps = InferReactProps<typeof suggestedActionsPropsSchema>;

function SuggestedActions(props: SuggestedActionsProps) {
  const { className } = validateProps(suggestedActionsPropsSchema, props);

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
        | 'signin'
        | 'webchat:callURL';
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
  return !children.length ? null : suggestedActionLayout === 'flow' ? (
    <RovingTabIndexComposer onEscapeKey={handleEscapeKey}>
      <SuggestedActionFlowContainer className={className} label={label}>
        {children}
      </SuggestedActionFlowContainer>
    </RovingTabIndexComposer>
  ) : suggestedActionLayout === 'stacked' ? (
    <RovingTabIndexComposer onEscapeKey={handleEscapeKey} orientation="vertical">
      <SuggestedActionStackedContainer className={className} label={label}>
        {children}
      </SuggestedActionStackedContainer>
    </RovingTabIndexComposer>
  ) : (
    <RovingTabIndexComposer onEscapeKey={handleEscapeKey}>
      <SuggestedActionCarouselContainer className={className} label={label}>
        {children}
      </SuggestedActionCarouselContainer>
    </RovingTabIndexComposer>
  );
}

SuggestedActions.displayName = 'SuggestedActions';

export default memo(SuggestedActions);
export { suggestedActionsPropsSchema, type SuggestedActionsProps };
