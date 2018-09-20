import { connect } from 'react-redux';
import React from 'react';

import WebChat from './WebChat';

class App extends React.Component {
  render() {
    const { props: {
      backgroundColor,
      dispatch
    } } = this;

    return (
      <div id="app" style={{ backgroundColor }}>
        <WebChat appDispatch={ dispatch } />
      </div>
    )
  }
}

export default connect(
  ({ backgroundColor }) => ({ backgroundColor })
)(App)
