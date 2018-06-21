import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import BasicFilm, { createBasicStyleSet } from 'react-film';

const ROOT_CSS = css({
  paddingLeft: 5,
  paddingRight: 5
});

const SUGGESTED_ACTION_CSS = css({
  display: 'inline-block',
  paddingBottom: 10,
  paddingLeft: 5,
  paddingRight: 5,
  paddingTop: 10,
  whiteSpace: 'initial'
});

const FILM_STYLES = createBasicStyleSet({
  flipperBoxWidth: 40,
  flipperSize: 20,
  scrollBarHeight: 6,
  scrollBarMargin: 2
});

export default props =>
  <BasicFilm
    autoCenter={ false }
    className={ classNames(ROOT_CSS + '', props.className) }
    showDots={ false }
    styleSet={ FILM_STYLES }
  >
    { React.Children.map(props.children, child => <div className={ SUGGESTED_ACTION_CSS }>{ child }</div>) }
  </BasicFilm>
