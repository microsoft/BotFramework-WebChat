import React from 'react';

export default class ScrollSpy extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleEvent = this.handleEvent.bind(this);
  }

  componentDidMount() {
    const { target } = this.props;

    if (target) {
      target.addEventListener(this.props.name, this.handleEvent, { passive: true });
      this.handleEvent(target);
    }
  }

  componentDidUpdate(prevProps) {
    const { name: prevName, target: prevTarget } = prevProps;
    const { name, target } = this.props;

    if (
      target !== prevTarget
      || name !== prevName
    ) {
      if (prevTarget) {
        prevTarget.removeEventListener(prevName, this.handleEvent);
      }

      if (target) {
        target.addEventListener(name, this.handleEvent, { passive: true });
        this.handleEvent(target);
      }
    }
  }

  componentWillUnmount() {
    const { target } = this.props;

    target && target.removeEventListener(this.props.name, this.handleEvent);
  }

  handleEvent() {
    this.props.onEvent && this.props.onEvent();
  }

  render() {
    return false;
  }
}
