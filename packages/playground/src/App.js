import { connect } from 'react-redux';
import { css } from 'glamor';
import { DirectLine } from 'botframework-directlinejs';
import { postActivity, startConnection } from 'backend';
import BasicWebChat from 'component';
import MarkdownIt from 'markdown-it';
import React from 'react';

const ROOT_CSS = css({
  height: '100%',

  '& > div.button-bar': {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    right: 0,
    top: 0,

    '& > button': {
      backgroundColor: 'rgba(128, 128, 128, .2)',
      border: 0,
      cursor: 'pointer',
      outline: 0,
      marginBottom: 10,
      padding: '5px 10px',

      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, .2)',
        color: 'White'
      }
    }
  }
});

const WEB_CHAT_CSS = css({
  height: '100%',
  margin: '0 auto',
  maxWidth: 768
});

class App extends React.Component {
  constructor(props) {
    super(props);

    const markdownIt = new MarkdownIt({ html: false, xhtmlOut: true, breaks: true, linkify: true, typographer: true });

    this.handlePostActivity = this.handlePostActivity.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleUseOfficialMockBotClick = this.handleUseOfficialMockBotClick.bind(this);

    this.renderMarkdown = markdownIt.render.bind(markdownIt);

    this.mainRef = React.createRef();

    const params = new URLSearchParams(window.location.search);
    const domain = params.get('domain');
    const secret = params.get('s');
    const token = params.get('t');

    this.state = {
      domain,
      secret,
      token
    };
  }

  componentDidMount() {
    const { state: { domain, secret, token } } = this;

    this.props.dispatch(startConnection({
      directLine: new DirectLine({
        domain,
        secret,
        token,
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

    // HACK: Focus send box should be done using context/composer
    const { current } = this.mainRef;
    const sendBox = current && current.querySelector('input[type="text"]');

    sendBox && sendBox.focus();
  }

  handleResetClick() {
    window.sessionStorage.removeItem('REDUX_STORE');
    window.location.reload();
  }

  handlePostActivity(activity) {
    this.props.dispatch(postActivity(activity));
  }

  async handleUseOfficialMockBotClick() {
    try {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/token-generate', { method: 'POST' });
      const { token } = await res.json();

      window.location.href = `?t=${ encodeURIComponent(token) }`;
    } catch (err) {
      alert('Failed to get Direct Line token for official MockBot');
    }
  }

  render() {
    const { props } = this;

    return (
      <div
        className={ ROOT_CSS }
        ref={ this.mainRef }
      >
        <BasicWebChat
          activities={ props.activities }
          className={ WEB_CHAT_CSS }
          postActivity={ this.handlePostActivity }
          renderMarkdown={ this.renderMarkdown }
          suggestedActions={ props.suggestedActions }
        />
        <div className="button-bar">
          <button
            onClick={ this.handleResetClick }
            type="button"
          >
            Remove history <small>(CTRL-R)</small>
          </button>
          <button
            onClick={ this.handleUseOfficialMockBotClick }
            type="button"
          >
            Connect to official MockBot
          </button>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ activities, suggestedActions }) => ({ activities, suggestedActions }),
)(App);
