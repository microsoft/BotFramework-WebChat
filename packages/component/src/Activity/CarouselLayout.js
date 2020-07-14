import { Composer, Context as FilmContext, createBasicStyleSet, Flipper } from 'react-film';

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import CarouselFilmStrip from './CarouselFilmStrip';
import useDirection from '../hooks/useDirection';
import useLocalizer from '../hooks/useLocalizer';
import useStyleSet from '../hooks/useStyleSet';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative'
});

const CarouselLayout = ({ activity, children, renderActivityStatus, renderAvatar }) => {
  const [{ carouselFlipper: carouselFlipperStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const filmStyleSet = createBasicStyleSet({ cursor: null });
  const leftSideFlipper = direction === 'rtl' ? '>' : '<';
  const localize = useLocalizer();
  const rightSideFlipper = direction === 'rtl' ? '<' : '>';

  return (
    <Composer dir={direction} numItems={React.Children.count(children)}>
      <FilmContext.Consumer>
        {({ scrollBarWidth }) => (
          <div className={classNames(ROOT_CSS + '', filmStyleSet.carousel + '')}>
            <CarouselFilmStrip
              activity={activity}
              renderActivityStatus={renderActivityStatus}
              renderAvatar={renderAvatar}
            />
            {scrollBarWidth !== '100%' && (
              <React.Fragment>
                <Flipper
                  aria-label={localize('CAROUSEL_FLIPPER_LEFT_ALT')}
                  blurFocusOnClick={true}
                  className={classNames(carouselFlipperStyleSet + '', filmStyleSet.leftFlipper + '')}
                  mode="left"
                >
                  <div className="button">{leftSideFlipper}</div>
                </Flipper>
                <Flipper
                  aria-label={localize('CAROUSEL_FLIPPER_RIGHT_ALT')}
                  blurFocusOnClick={true}
                  className={classNames(carouselFlipperStyleSet + '', filmStyleSet.rightFlipper + '')}
                  mode="right"
                >
                  <div className="button">{rightSideFlipper}</div>
                </Flipper>
              </React.Fragment>
            )}
          </div>
        )}
      </FilmContext.Consumer>
    </Composer>
  );
};

CarouselLayout.defaultProps = {
  children: undefined,
  renderActivityStatus: false,
  renderAvatar: false
};

CarouselLayout.propTypes = {
  activity: PropTypes.any.isRequired,
  children: PropTypes.any,
  renderActivityStatus: PropTypes.oneOfType([PropTypes.oneOf([false, 'indent']), PropTypes.func]),
  renderAvatar: PropTypes.oneOfType([PropTypes.oneOf([false, 'indent']), PropTypes.func])
};

export default CarouselLayout;
