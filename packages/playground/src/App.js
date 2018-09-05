import { connect } from 'react-redux';
import { connect as createConnectAction, postActivity } from 'backend';
import { css } from 'glamor';
import { DirectLine } from 'botframework-directlinejs';
import BasicWebChat from 'component';
import iterator from 'markdown-it-for-inline';
import MarkdownIt from 'markdown-it';
import React from 'react';
import {
  SpeechGrammarList,
  speechSynthesis,
  SpeechSynthesisUtterance
} from 'web-speech-cognitive-services';
import createSpeechRecognitionWithSpeechTokenClass from './SpeechRecognitionWithSpeechToken';

css.global('body', {
  backgroundColor: '#EEE'
});

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
    const directLineToken = params.get('t');
    const domain = params.get('domain');
    const webSocket = params.get('websocket');
    const speech = params.get('speech');
    let webSpeechPolyfill;

    if (speech === 'cs') {
      const token = {
        authorized: fetch('https://webchat-mockbot.azurewebsites.net/speech/token', { method: 'POST' }).then(res => res.json()).then(({ token }) => token)
      };

      speechSynthesis.speechToken = token;
      webSpeechPolyfill = {
        SpeechGrammarList,
        SpeechRecognition: createSpeechRecognitionWithSpeechTokenClass(token),
        speechSynthesis,
        SpeechSynthesisUtterance
      };
    } else {
      webSpeechPolyfill = {
        SpeechGrammarList: window.SpeechGrammarList,
        SpeechRecognition: window.SpeechRecognition,
        speechSynthesis: window.speechSynthesis,
        SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
      };
    }

    this.state = {
      domain,
      directLineToken,
      webSocket: webSocket === 'true' || +webSocket,
      webSpeechPolyfill
    };
  }

  componentDidMount() {
    const { state: { domain, directLineToken: token, webSocket } } = this;

    this.props.dispatch(createConnectAction({
      directLine: new DirectLine({
        domain,
        fetch,
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
      const directLineTokenRes = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });

      if (directLineTokenRes.status !== 200) {
        throw new Error(`Server returned ${ directLineTokenRes.status } while requesting for Direct Line token`);
      }

      const { token } = await directLineTokenRes.json();

      window.sessionStorage.removeItem('REDUX_STORE');
      window.location.href = `?speech=cs&websocket=true&t=${ encodeURIComponent(token) }`;
    } catch (err) {
      console.log(err);
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
          className={ WEB_CHAT_CSS }
          postActivity={ this.handlePostActivity }
          renderMarkdown={ this.renderMarkdown }
          suggestedActions={ props.suggestedActions }
          webSpeechPolyfill={ state.webSpeechPolyfill }
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
