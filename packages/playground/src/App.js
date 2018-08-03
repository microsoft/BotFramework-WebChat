import { startConnection } from 'backend';
import { connect } from 'react-redux';
import { css } from 'glamor';
import { DirectLine } from 'botframework-directlinejs';
import MarkdownIt from 'markdown-it';
import React, { Component } from 'react';

import BasicWebChat from 'component';
import postActivity from '../node_modules/backend/lib/Actions/postActivity';

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

    this.handleSend = this.handleSend.bind(this);
    this.renderMarkdown = markdownIt.render.bind(markdownIt);
  }

  componentDidMount() {
    this.props.dispatch(startConnection({
      directLine: new DirectLine({
        domain: 'http://localhost:3001/mock',
        fetch,
        createFormData: attachments => {
          const formData = new FormData();

          attachments.forEach(({ contentType, data, filename, name }) => {
            formData.append(name, new Blob(data, { contentType }), filename);
          });

          return formData;
        },
        webSocket: false
      }),
      userID: 'default-user',
      username: 'User-1'
    }));
  }

  handleSend({ value }) {
    this.props.dispatch(postActivity({
      type: 'message',
      text: value
    }));
  }

  render() {
    const { props } = this;

    console.log(props.activities);

    return (
      <div className={ ROOT_CSS }>
        <BasicWebChat
          activities={ props.activities }
          className={ WEB_CHAT_CSS }
          renderMarkdown={ this.renderMarkdown }
          onSend={ this.handleSend }
        />
      </div>
    );
  }
}

export default connect(({ activities }) => ({ activities }))(App);
