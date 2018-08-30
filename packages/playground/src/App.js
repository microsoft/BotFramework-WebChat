import { connect } from 'react-redux';
import { connect as createConnectAction, postActivity } from 'backend';
import { css } from 'glamor';
import { DirectLine } from 'botframework-directlinejs';
import BasicWebChat from 'component';
import iterator from 'markdown-it-for-inline';
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

    this.handleUseEmulatorCoreClick = this.handleUseEmulatorCoreClick.bind(this);
    this.handlePostActivity = this.handlePostActivity.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleUseOfficialMockBotClick = this.handleUseOfficialMockBotClick.bind(this);

    // TODO: We should include Markdown-It in our component package
    const customMarkdownIt = new MarkdownIt({
      breaks: true,
      html: false,
      linkify: true,
      typographer: true,
      xhtmlOut: true
    }).use(iterator, 'url_new_win', 'link_open', (tokens, index) => {
      // TODO: Refactor this code
      const targetAttrIndex = tokens[index].attrIndex('target');

      if (~targetAttrIndex) {
        tokens[index].attrs[targetAttrIndex][1] = '_blank';
      } else {
        tokens[index].attrPush(['target', '_blank']);
      }

      const relAttrIndex = tokens[index].attrIndex('rel');

      if (~relAttrIndex) {
        tokens[index].attrs[relAttrIndex][1] = 'noopener noreferrer';
      } else {
        tokens[index].attrPush(['target', 'noopener noreferrer']);
      }
    });

    this.renderMarkdown = customMarkdownIt.render.bind(customMarkdownIt);

    this.mainRef = React.createRef();

    const params = new URLSearchParams(window.location.search);
    const domain = params.get('domain');
    const secret = params.get('s');
    const token = params.get('t');
    const webSocket = params.get('websocket');

    this.state = {
      domain,
      secret,
      token,
      webSocket: webSocket === 'true' || +webSocket
    };
  }

  componentDidMount() {
    const { state: { domain, secret, token, webSocket } } = this;

    this.props.dispatch(createConnectAction({
      directLine: new DirectLine({
        domain,
        fetch,
        secret,
        token,
        webSocket,
        createFormData: attachments => {
          const formData = new FormData();

          attachments.forEach(({ contentType, data, filename, name }) => {
            formData.append(name, new Blob(data, { contentType }), filename);
          });

          return formData;
        }
      }),
      userID: 'default-user',
      username: 'User-1'
    }));

    // HACK: Focus send box should be done using context/composer
    const { current } = this.mainRef;
    const sendBox = current && current.querySelector('input[type="text"]');

    sendBox && sendBox.focus();
  }

  handleUseEmulatorCoreClick() {
    window.sessionStorage.removeItem('REDUX_STORE');
    window.location.href = '?domain=http://localhost:5000/v3/directline&websocket=0';
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

      window.sessionStorage.removeItem('REDUX_STORE');
      window.location.href = `?t=${ encodeURIComponent(token) }&websocket=true`;
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
            Start conversation with official MockBot
          </button>
          <button
            onClick={ this.handleUseEmulatorCoreClick }
            type="button"
          >
            Start conversation with Emulator Core
          </button>
          <div>
            <label>
              <input checked={ true } disabled={ true } type="checkbox" />
              Reliable connection
            </label>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ activities, suggestedActions }) => ({ activities, suggestedActions }),
)(App);
