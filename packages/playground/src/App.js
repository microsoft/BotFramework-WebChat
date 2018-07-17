import { css } from 'glamor';
import React, { Component } from 'react';
import MarkdownIt from 'markdown-it';

import BasicWebChat from 'component';

const ROOT_CSS = css({
  height: '100%'
});

const WEB_CHAT_CSS = css({
  height: '100%',
  margin: '0 auto',
  maxWidth: 768
});

class App extends Component {
  constructor(props) {
    super(props);

    const markdownIt = new MarkdownIt({ html: false, xhtmlOut: true, breaks: true, linkify: true, typographer: true });

    this.renderMarkdown = markdownIt.render.bind(markdownIt);
  }

  render() {
    return (
      <div className={ ROOT_CSS }>
        <BasicWebChat
          className={ WEB_CHAT_CSS }
          renderMarkdown={ this.renderMarkdown }
        />
      </div>
    );
  }
}

export default App;
