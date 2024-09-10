import React from 'react';

import ReactWebChat, { createDirectLine } from 'botframework-webchat';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      directLine: null
    };
  }

  componentDidMount() {
    this.fetchToken();
  }

  async fetchToken() {
    const res = await fetch(
      'https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline',
      { method: 'POST' }
    );
    const { token } = await res.json();

    this.setState(() => ({
      directLine: createDirectLine({ token })
    }));
  }

  render() {
    return this.state.directLine ? (
      <ReactWebChat className="chat" directLine={this.state.directLine} {...this.props} />
    ) : (
      <div>Connecting to bot&hellip;</div>
    );
  }
}
