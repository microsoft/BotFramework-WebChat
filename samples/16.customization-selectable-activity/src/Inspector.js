import React, { Component } from "react";

function NothingSelected() {
  return (
    <>
      <h3>Nothing selected</h3>
      <p>Click on any message sent from the user or the bot to inspect it.</p>
    </>
  )
}

export default class Inspector extends Component {
  render() {
    const { inspectedObject } = this.props;

    return (
      <div className="inspector">
        <div>
          { inspectedObject ?
            <pre>{ JSON.stringify(inspectedObject, null, 4) }</pre>
            : <NothingSelected />
          }
        </div>
      </div>
    )
  }
}
