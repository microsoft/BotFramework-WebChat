import { connect } from 'react-redux';
import React from 'react';

import ReactWebChat from './WebChat';

class App extends React.Component {
  render() {
    const { props: {
      backgroundColor,
      dispatch
    } } = this;

    return (
      <div id="app" style={{ backgroundColor }}>
        <ReactWebChat appDispatch={ dispatch } />
      </div>
    )
  }
}

export default connect(
  ({ backgroundColor }) => ({ backgroundColor })
)(App)
