import { css } from 'glamor';
import classNames from 'classnames';
import memoize from 'memoize-one';
import React from 'react';

const ROOT_CSS = css({
  backgroundPosition: '50%',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover'
});

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);

    this.createStyle = memoize((src, width, height) => ({
      backgroundImage: `url(${ src })`,
      height,
      width
    }));
  }

  render() {
    const { props } = this;
    const headerImageStyle = this.createStyle(
      props.src,
      props.width,
      props.height
    );

    return (
      <div
        className={ classNames(ROOT_CSS + '', (props.className || '') + '') }
        role="image"
        style={ headerImageStyle }
      />
    );
  }
}
