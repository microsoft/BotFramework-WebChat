import React from 'react';
import { css } from 'glamor';

import connectToWebChat from '../connectToWebChat';
import {Composer, Dots, FilmStrip, ScrollBar } from 'react-film';
import Flipper from './Flipper';

const BASIC_FILM_CSS = css({});

const FLIPPERS_CONTAINER_CSS = css({
    width: '100%',
    position: 'relative'
});

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(({ alt, children, showDots }) =>
  <Composer>
      <div className={BASIC_FILM_CSS}>
          <FilmStrip>
              { children }
          </FilmStrip>
          <ScrollBar />
          {/*<div className={FLIPPERS_CONTAINER_CSS}>*/}
              {/*<Flipper mode="left" />*/}
              {/*<Flipper mode="right" />*/}
          {/*</div>*/}
      </div>
      { showDots &&
          <Dots>
              { () => '.' }
          </Dots>
      }
  </Composer>
)
