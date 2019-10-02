import React, { Component } from 'react';

function NothingSelected() {
  return (
    <React.Fragment>
      <h4>Nothing selected</h4>
      <p>Click on any message sent from the user or the bot to inspect it.</p>
    </React.Fragment>
  );
}

export default class Inspector extends Component {
  render() {
    const { inspectedObject, inspectorRef } = this.props;

    return (
      <div className="inspector" tabIndex="-1" ref={inspectorRef}>
        <h2>Inspector</h2>
        <div>{inspectedObject ? <pre>{JSON.stringify(inspectedObject, null, 4)}</pre> : <NothingSelected />}</div>
      </div>
    );
  }
}
