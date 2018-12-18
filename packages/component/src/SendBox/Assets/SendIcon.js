import { css } from 'glamor';
import React from 'react';

const ROOT_CSS = css({
  height: 28,
  overflow: 'hidden',
  padding: 6,
  width: 28
});

export default () =>
  <div className={ ROOT_CSS }>
    <svg
      height={ 28 }
      viewBox="0 0 45.7 33.8"
      width={ 28 }
    >
      <path d="M8.55 25.25l21.67-7.25H11zm2.41-9.47h19.26l-21.67-7.23zm-6 13l4-11.9L5 5l35.7 11.9z" clipRule="evenodd" />
    </svg>
  </div>
