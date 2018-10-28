import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';
import EventSpy from '../EventSpy';
import SpineTo from '../SpineTo';

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.handleScroll = this.handleScroll.bind(this);
    this.handleScrollEnd = this.handleScrollEnd.bind(this);

    this.state = {
      context: {
        _handleUpdate: () => {
          const { context } = this.state;

          context.atEnd && context.scrollToEnd();
        },
        _setTarget: target => this.setState(() => ({ target })),
        atBottom: true,
        atEnd: true,
        atTop: true,
        mode: props.mode,
        scrollTo: scrollTop => this.setState(() => ({ scrollTop })),
        scrollToBottom: () => {
          const { context, target } = this.state;

          context.scrollTo(target && (target.scrollHeight - target.offsetHeight));
        },
        scrollToEnd: () => {
          const { context } = this.state;

          context.mode === 'top' ? context.scrollToTop() : context.scrollToBottom();
        },
        scrollToTop: () => this.state.context.scrollTo(0),
        threshold: 10
      },
      scrollTop: null,
      target: null
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(({ context }) => ({
      context: {
        ...context,
        mode: nextProps.mode === 'top' ? 'top' : 'bottom',
        threshold: nextProps.threshold
      }
    }));
  }

  handleScroll() {
    this.setState(({ context, target }) => {
      if (target) {
        const { mode, threshold } = context;
        const { offsetHeight, scrollHeight, scrollTop } = target;
        const atBottom = scrollHeight - scrollTop - offsetHeight <= threshold;
        const atTop = scrollTop <= threshold;

        return {
          context: {
            ...context,
            atBottom,
            atEnd: mode === 'top' ? atTop : atBottom,
            atTop
          }
        };
      }
    });
  }

  handleScrollEnd() {
    this.setState(() => ({ scrollTop: null }));
  }

  render() {
    const { scrollTop, target } = this.state;

    return (
      <Context.Provider value={ this.state.context }>
        { this.props.children }
        {
          target &&
            <EventSpy
              name="scroll"
              onEvent={ this.handleScroll }
              target={ target }
            />
        }
        {
          target && typeof scrollTop === 'number' &&
            <SpineTo
              name="scrollTop"
              onEnd={ this.handleScrollEnd }
              target={ target }
              value={ scrollTop }
            />
        }
      </Context.Provider>
    );
  }
}

Composer.defaultProps = {
  threshold: 10
};

Composer.propTypes = {
  threshold: PropTypes.number
};
