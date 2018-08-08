import { startConnection } from 'backend';
import { connect } from 'react-redux';
import { css } from 'glamor';
import { DirectLine } from 'botframework-directlinejs';
import MarkdownIt from 'markdown-it';
import React, { Component } from 'react';

import BasicWebChat from 'component';
import postActivity from '../node_modules/backend/lib/Actions/postActivity';

const ROOT_CSS = css({
  height: '100%',

  '& > button': {
    backgroundColor: 'rgba(128, 128, 128, .2)',
    border: 0,
    cursor: 'pointer',
    outline: 0,
    padding: '5px 10px',
    position: 'absolute',
    right: 0,
    top: 0,

    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, .2)',
      color: 'White'
    }
  }
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

    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.renderMarkdown = markdownIt.render.bind(markdownIt);
  }

  componentDidMount() {
    this.props.dispatch(startConnection({
      directLine: new DirectLine({
        // domain: 'http://localhost:3001/mock',
        domain: 'http://localhost:5000/v3/directline',
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

  handleResetClick() {
    window.sessionStorage.removeItem('REDUX_STORE');
    window.location.reload();
  }

  handleSend(activity) {
    this.props.dispatch(postActivity(activity));
  }

  render() {
    const { props } = this;

    return (
      <div className={ ROOT_CSS }>
        <BasicWebChat
          activities={ props.activities }
          className={ WEB_CHAT_CSS }
          send={ this.handleSend }
          renderMarkdown={ this.renderMarkdown }
          suggestedActions={ props.suggestedActions }
        />
        <button
          onClick={ this.handleResetClick }
          type="button"
        >
          Remove history
        </button>
      </div>
    );
  }
}

export default connect(({ activities, suggestedActions }) => ({ activities, suggestedActions }))(App);
