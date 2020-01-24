import { Composer, Context as FilmContext, createBasicStyleSet, Flipper } from 'react-film';

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import CarouselFilmStrip from './CarouselFilmStrip';
import useDirection from '../hooks/useDirection';
import useLocalize from '../hooks/useLocalize';
import useStyleSet from '../hooks/useStyleSet';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative'
});

const CarouselLayout = ({ activity, children, nextVisibleActivity }) => {
  const [{ carouselFlipper: carouselFlipperStyleSet }] = useStyleSet();

  const [direction] = useDirection();
  const leftLabel = useLocalize('Left');
  const leftSideFlipper = direction === 'ltr' ? '<' : '>';
  const rightLabel = useLocalize('Right');
  const rightSideFlipper = direction === 'ltr' ? '>' : '<';

  const filmStyleSet = createBasicStyleSet({ cursor: null });

  return (
    <Composer dir={direction} numItems={React.Children.count(children)}>
      <FilmContext.Consumer>
        {({ scrollBarWidth }) => (
          <div className={classNames(ROOT_CSS + '', filmStyleSet.carousel + '')}>
            <CarouselFilmStrip activity={activity} nextVisibleActivity={nextVisibleActivity}>
              {children}
            </CarouselFilmStrip>
            {scrollBarWidth !== '100%' && (
              <React.Fragment>
                <Flipper
                  aria-label={leftLabel}
                  blurFocusOnClick={true}
                  className={classNames(carouselFlipperStyleSet + '', filmStyleSet.leftFlipper + '')}
                  mode="left"
                >
                  <div className="button">{leftSideFlipper}</div>
                </Flipper>
                <Flipper
                  aria-label={rightLabel}
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
  nextVisibleActivity: undefined
};

CarouselLayout.propTypes = {
  activity: PropTypes.any.isRequired,
  children: PropTypes.any,
  nextVisibleActivity: PropTypes.any
};

export default CarouselLayout;
