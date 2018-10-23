import { Composer, Context as FilmContext, createBasicStyleSet, Flipper } from 'react-film';
import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import CarouselFilmStrip from './CarouselFilmStrip';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative'
});

export default ({ activity, children, showTimestamp }) => {
  const styleSet = createBasicStyleSet();

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
                <Flipper className={ styleSet.leftFlipper + '' } mode="left"><div>&lt;</div></Flipper>
                <Flipper className={ styleSet.rightFlipper + '' } mode="right"><div>&gt;</div></Flipper>
              </React.Fragment>
            }
          </div>
        }
      </FilmContext.Consumer>
    </Composer>
  );
}
