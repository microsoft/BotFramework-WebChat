import { css } from 'glamor';
import React, { Component } from 'react';

import BasicWebChat from 'component';

const ROOT_CSS = css({
  height: '100%'
});

const WEB_CHAT_CSS = css({
  height: '100%'
});

class App extends Component {
  render() {
    return (
      <div className={ ROOT_CSS }>
        <BasicWebChat className={ WEB_CHAT_CSS } />
      </div>
    );
  }
}

export default App;
