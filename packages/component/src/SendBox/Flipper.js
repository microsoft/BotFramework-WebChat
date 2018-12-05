import React from 'react';
import { Context } from 'react-film';
import ArrowRight from './Assets/ArrowRight';
import ArrowLeft from './Assets/ArrowLeft';
import { css } from 'glamor';

import connectToWebChat from '../connectToWebChat';

const FLIPPER_CSS = css({
    position: 'absolute',
    backgroundColor: 'transparent',
    color: '#dcdcdc',
    borderRadius: 20,
    marginTop: -55,
    border: '1px solid #dcdcdc',
    boxShadow: '1px 1px 2px 0 #999',
    overflow: 'hidden',
    padding: 3,
    height: 35,
    fontSize: 17,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',

    '&:focus, &:hover': {
        textDecoration: 'none',
        outline: 0,
        backgroundColor: '#fff',
        borderColor: '#dcdcdc',
        color: '#fff'
    },

    '&:active': {
        backgroundColor: '#fff',
        boxShadow: 'inset 1px 1px 2px 0 #999',
        color: '#fff'
    },

    '&.right.ltr': {
        right: 0
    },

    '&.left.ltr': {
        left: 0
    },

    '&.rtl': {
        transform: 'scaleX(-1)',
        filter: 'FlipH'
    },

    '&.right.rtl': {
        left: 0
    },

    '&.left.rtl': {
        right: 0
    }
});

const connectFlipper = (...selectors) => connectToWebChat(
  ({
      direction
   }) => ({
      direction
  }),
  ...selectors
);

export default connectFlipper(
  ({ styleSet }) => ({ styleSet })
)(({ mode, direction }) =>
  <Context.Consumer>
      { context =>
        <button
          className={[FLIPPER_CSS, mode, direction].join(' ')}
          data-direction={mode}
          onClick={ mode === 'left' ? context.scrollOneLeft : context.scrollOneRight }>
            { mode === 'left' ?
              <ArrowLeft /> :
              <ArrowRight />
            }
        </button>
      }
  </Context.Consumer>
);

export { connectFlipper }
