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

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.handleUseEmulatorCoreClick = this.handleUseEmulatorCoreClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleUseMockBot = this.handleUseMockBot.bind(this);

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
        SpeechGrammarList: window.SpeechGrammarList || window.webkitSpeechGrammarList,
        SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition,
        speechSynthesis: window.speechSynthesis,
        SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
      };
    }

    this.state = {
      directLine: new DirectLine({
        domain,
        fetch,
        token: directLineToken,
        webSocket: webSocket === 'true' || +webSocket,
        createFormData: attachments => {
          const formData = new FormData();

          attachments.forEach(({ contentType, data, filename, name }) => {
            formData.append(name, new Blob(data, { contentType }), filename);
          });

          return formData;
        }
      }),
      webSpeechPolyfill
    };
  }

  componentDidMount() {
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

  async handleUseMockBot(url) {
    try {
      const directLineTokenRes = await fetch(`${ url }/directline/token`, { method: 'POST' });

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
    const { state } = this;

    return (
      <div
        className={ ROOT_CSS }
        ref={ this.mainRef }
      >
        <BasicWebChat
          className={ WEB_CHAT_CSS }
          directLine={ state.directLine }
          renderMarkdown={ this.renderMarkdown }
          userID="default-user"
          username="User 1"
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
            onClick={ this.handleUseMockBot.bind(this, 'https://webchat-mockbot.azurewebsites.net') }
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
          <button
            onClick={ this.handleUseMockBot.bind(this, 'http://localhost:3978') }
            type="button"
          >
            Start conversation with local MockBot
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
