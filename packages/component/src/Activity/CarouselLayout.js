import { Composer, Context as FilmContext, createBasicStyleSet, Flipper } from 'react-film';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import CarouselFilmStrip from './CarouselFilmStrip';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative'
});

const CarouselLayout = ({ activity, children, language, styleSet, timestampClassName }) => {
  const filmStyleSet = createBasicStyleSet({ cursor: null });

  return (
    <Composer numItems={React.Children.count(children)}>
      <FilmContext.Consumer>
        {({ scrollBarWidth }) => (
          <div className={classNames(ROOT_CSS + '', filmStyleSet.carousel + '')}>
            <CarouselFilmStrip activity={activity} timestampClassName={timestampClassName}>
              {children}
            </CarouselFilmStrip>
            {scrollBarWidth !== '100%' && (
              <React.Fragment>
                <Flipper
                  aria-label={localize('Left', language)}
                  className={classNames(styleSet.carouselFlipper + '', filmStyleSet.leftFlipper + '')}
                  mode="left"
                >
                  <div className="button">{'<'}</div>
                </Flipper>
                <Flipper
                  aria-label={localize('Right', language)}
                  className={classNames(styleSet.carouselFlipper + '', filmStyleSet.rightFlipper + '')}
                  mode="right"
                >
                  <div className="button">{'>'}</div>
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
  timestampClassName: ''
};

CarouselLayout.propTypes = {
  activity: PropTypes.any.isRequired,
  children: PropTypes.any,
  language: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    carouselFlipper: PropTypes.any.isRequired
  }).isRequired,
  timestampClassName: PropTypes.string
};

export default connectToWebChat(({ language, styleSet }) => ({ language, styleSet }))(CarouselLayout);
