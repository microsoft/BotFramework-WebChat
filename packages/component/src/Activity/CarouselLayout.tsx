import { useCarouselState } from '@msinternal/botframework-webchat-component-carousel';
import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { Fragment, memo } from 'react';
import { omit, pipe, readonly } from 'valibot';

import CarouselComposer from '../Carousel/CarouselComposer';
import CarouselFlipper from '../Carousel/CarouselFlipper';
import CarouselFilmStrip, { carouselFilmStripPropsSchema } from './CarouselFilmStrip';

import styles from './CarouselLayout.module.css';

const { useLocalizer } = hooks;

// Same props as the filmstrip, except `className`.
const carouselLayoutPropsSchema = pipe(omit(carouselFilmStripPropsSchema.pipe[0], ['className']), readonly());

type CarouselLayoutProps = InferReactProps<typeof carouselLayoutPropsSchema>;

function CarouselLayoutCore(props: CarouselLayoutProps) {
  const {
    activity,
    hideTimestamp = false,
    renderActivityStatus = false,
    renderAttachment,
    renderAvatar = false,
    showCallout = true
  } = validateProps(carouselLayoutPropsSchema, props);

  const [{ atEnd, atStart, overflowing, scrolling }] = useCarouselState();
  const classNames = useStyles(styles);
  const localize = useLocalizer();

  return (
    <div className={classNames['carousel-layout']}>
      <div
        className={cx(classNames['carousel-layout__main'], 'react-film__main', {
          [classNames['carousel-layout__main--scrolling']]: scrolling,
          'react-film__main--scrolling': scrolling
        })}
      >
        <CarouselFilmStrip
          activity={activity}
          hideTimestamp={hideTimestamp}
          renderActivityStatus={renderActivityStatus}
          renderAttachment={renderAttachment}
          renderAvatar={renderAvatar}
          showCallout={showCallout}
        />
        {overflowing && (
          <Fragment>
            <CarouselFlipper
              aria-label={localize('CAROUSEL_FLIPPER_PREVIOUS_ALT')}
              atEdge={atStart}
              autoHide={true}
              mode="previous"
            />
            <CarouselFlipper
              aria-label={localize('CAROUSEL_FLIPPER_NEXT_ALT')}
              atEdge={atEnd}
              autoHide={true}
              mode="next"
            />
          </Fragment>
        )}
      </div>
    </div>
  );
}

CarouselLayoutCore.displayName = 'CarouselLayoutCore';

function CarouselLayout(props: CarouselLayoutProps) {
  return (
    <CarouselComposer>
      <CarouselLayoutCore {...props} />
    </CarouselComposer>
  );
}

CarouselLayout.displayName = 'CarouselLayout';

export default memo(CarouselLayout);
export { carouselLayoutPropsSchema, type CarouselLayoutProps };
