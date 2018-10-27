import { Composer, Context as FilmContext, createBasicStyleSet, Flipper } from 'react-film';
import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectWithContext from '../connectWithContext';
import CarouselFilmStrip from './CarouselFilmStrip';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative'
});

export default connectWithContext(
  ({ settings: { language } }) => ({ language }),
  ({ styleSet }) => ({ styleSet })
)(({ activity, children, language, showTimestamp, styleSet }) => {
  const filmStyleSet = createBasicStyleSet();

  return (
    <Composer>
      <FilmContext.Consumer>
        { ({ scrollBarWidth }) =>
          <div className={ classNames(ROOT_CSS + '', styleSet.carousel + '') }>
            <CarouselFilmStrip activity={ activity } showTimestamp={ showTimestamp }>
              { children }
            </CarouselFilmStrip>
            { scrollBarWidth !== '100%' &&
              <React.Fragment>
                <Flipper
                  className={ classNames(
                    styleSet.carouselFlipper + '',
                    filmStyleSet.leftFlipper + ''
                  ) }
                  mode="left"
                >
                  <div aria-label={ localize('Left', language) } className="button">&lt;</div>
                </Flipper>
                <Flipper
                  className={ classNames(
                    styleSet.carouselFlipper + '',
                    filmStyleSet.rightFlipper + ''
                  ) }
                  mode="right"
                >
                  <div aria-label={ localize('Right', language) } className="button">&gt;</div>
                </Flipper>
              </React.Fragment>
            }
          </div>
        }
      </FilmContext.Consumer>
    </Composer>
  );
})
