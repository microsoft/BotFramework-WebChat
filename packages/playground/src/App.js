import { connect } from 'react-redux';
import { connect as createConnectAction, postActivity } from 'backend';
import { css } from 'glamor';
import { DirectLine } from 'botframework-directlinejs';
import BasicWebChat from 'component';
import classNames from 'classnames';
import iterator from 'markdown-it-for-inline';
import MarkdownIt from 'markdown-it';
import React from 'react';

const ROOT_CSS = css({
  height: '100%',

  '& > div.button-bar': {
    display      : 'flex',
    flexDirection: 'column',
    position     : 'absolute',
    right        : 0,
    top          : 0,

    '& > button': {
      backgroundColor: 'rgba(128, 128, 128, .2)',
      border         : 0,
      cursor         : 'pointer',
      marginBottom   : 10,
      outline        : 0,
      padding        : '5px 10px',

      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, .2)',
        color: 'White'
      }
    }
  },

  '& > div.radio':{
    display        : 'flex',
    flexDirection  : 'column',
    left           : 0,
    position       : 'absolute',
    top            : 0,

    '& > label': {
      backgroundColor: 'rgba(128, 128, 128, .2)',
      border         : 0,
      cursor         : 'pointer',
      marginBottom   : 10,
      outline        : 0,
      padding        : '5px 10px',

      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, .2)',
        color: 'White'
      }
    }
  }
});

const WEB_CHAT_CSS = css({
  height: '100%',
  margin: '0 auto'
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.handlePostActivity = this.handlePostActivity.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleScreenWidthChange = this.handleScreenWidthChange.bind(this);
    this.handleUseEmulatorCoreClick = this.handleUseEmulatorCoreClick.bind(this);
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
      screenWidth: 768,
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

  handleScreenWidthChange({ target: { value } }) {
    this.setState(() => ({ screenWidth: +value }));
  }

  async handleUseOfficialMockBotClick() {
    try {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/token-generate', { method: 'POST' });
      const { token } = await res.json();

      window.sessionStorage.removeItem('REDUX_STORE');
      window.location.href = `?t=${ encodeURIComponent(token) }`;
    } catch (err) {
      alert('Failed to get Direct Line token for official MockBot');
    }
  }

  render() {
    const { props, state } = this;

    return (
      <div
        className={ ROOT_CSS }
        ref={ this.mainRef }
      >
        <BasicWebChat
          activities={ props.activities }
          className={ classNames(
            WEB_CHAT_CSS + '',
            css({ maxWidth: state.screenWidth }) + ''
          ) }
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
        <div className="radio">
          <label>
            <input type="radio" checked={ state.screenWidth === 1024 } name="screen-width" value="1024" onChange={ this.handleScreenWidthChange } />
            1024px iPad Pro 12.9-inch
          </label>
          <label>
            <input type="radio" checked={ state.screenWidth === 834 } name="screen-width" value="834" onChange={ this.handleScreenWidthChange } />
            834px iPad Pro 10.5-inch
          </label>
          <label>
            <input type="radio" checked={ state.screenWidth === 768 } name="screen-width" value="768" onChange={ this.handleScreenWidthChange } />
            768px iPad mini
          </label>
          <label>
            <input type="radio" checked={ state.screenWidth === 414 } name="screen-width" value="414" onChange={ this.handleScreenWidthChange } />
            414px iPhone 6 Plus
          </label>
          <label>
            <input type="radio" checked={ state.screenWidth === 375 } name="screen-width" value="375" onChange={ this.handleScreenWidthChange } />
            375px iPhone 6
          </label>
          <label>
            <input type="radio" checked={ state.screenWidth === 360 } name="screen-width" value="360" onChange={ this.handleScreenWidthChange } />
            360px Android
          </label>
          <label>
            <input type="radio" checked={ state.screenWidth === 320 } name="screen-width" value="320" onChange={ this.handleScreenWidthChange } />
            320px iPhone 5S
          </label>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ activities, suggestedActions }) => ({ activities, suggestedActions }),
)(App);
