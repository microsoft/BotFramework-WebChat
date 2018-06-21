import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

const ROOT_CSS = css({
  backgroundColor: 'Transparent',
  border: 0
});

export default class TextBox extends React.Component {
  render() {
    const { props } = this;

    return (
      <input
        className={ classNames(ROOT_CSS + '', props.className + '') }
        type="text"
      />
    );
  }
}
