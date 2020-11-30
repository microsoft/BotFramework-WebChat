import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps } from './Chat';
import { render, renderExpandableTemplate, renderFullScreenTemplate } from './AppService'
import { DirectLine } from 'botframework-directlinejs';
import * as konsole from './Konsole';

export type Theme = {
    mainColor: string
    template: any,
    customCss?: string
}

export type AppProps = ChatProps & {theme?: Theme, header?: {textWhenCollapsed?: string, text: string}, autoExpandTimeout?: number};

export const App = async (props: AppProps, container?: HTMLElement) => {
    konsole.log("BotChat.App props", props);

    // FEEDYOU generate user ID if not present in props, make sure its always string
    props.user = {
        name: "Uživatel",
        ...props.user,
        id: props.user && props.user.id ? "" + props.user.id : MakeId()
    };

    // FEEDYOU fetch DL token from bot when no token or secret found
    const remoteConfig = props.bot && props.bot.id && !props.botConnection && (!props.directLine || (!props.directLine.secret && !props.directLine.token))
    if (remoteConfig) {
        // TODO test IE11 https://github.com/matthew-andrews/isomorphic-fetch
        try {
            const response = await fetch(`https://${props.bot.id}.azurewebsites.net/webchat/config`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                body: JSON.stringify({
                    user: props.user,
                })
            })
            const body = await response.json()
            console.log('Token response', body)

            props.botConnection = new DirectLine({...(props.directLine || {}), token: body.token});
            delete props.directLine

            if (body.testMode && window.location.hash !== '#feedbot-test-mode') {
                document.getElementsByTagName('body')[0].classList.add('feedbot-disabled')
                return
            } else {
                document.getElementsByTagName('body')[0].classList.add('feedbot-enabled')
            }

            // TODO configurable template system based on config
            const config = body.config
            if (config && config.template) {
                props.theme = {...props.theme, template: {...config.template, ...(props.theme ? props.theme.template : {})}, mainColor: config.mainColor || props.theme.mainColor}

                if (config.showInput === 'auto') {
                  props.disableInputWhenNotNeeded = true
                }

                if (config.template.autoExpandTimeout > 0) {
                  props.autoExpandTimeout = config.template.autoExpandTimeout
                }

                if (config.customCss) {
                  props.theme.customCss = config.customCss
                }

                if (config.template.headerText) {
                  props.header = {...(props.header || {}), text: config.template.headerText}
                }

                if (config.template.collapsedHeaderText) {
                  props.header = {...(props.header || {text: 'Chatbot'}), textWhenCollapsed: config.template.collapsedHeaderText}
                }
            }

        } catch (err) {
            console.error('Token response error', err)
            return
        }
    }

    // FEEDYOU props defaults
    props.showUploadButton = props.hasOwnProperty('showUploadButton') ? props.showUploadButton : false;
    props.resize = props.hasOwnProperty('resize') ? props.resize : 'detect';
    props.locale = props.hasOwnProperty('locale') ? props.locale : 'cs-cz';

    // FEEDYOU configurable theming
    if (props.theme || !container) {
        const theme = {mainColor: '#D83838', ...props.theme}
        const themeStyle = document.createElement('style');
        themeStyle.type = 'text/css';
        themeStyle.appendChild(document.createTextNode(getStyleForTheme(theme, remoteConfig)));
        document.head.appendChild(themeStyle);
    }

    // FEEDYOU use twemoji to make emoji compatible
    const script = document.createElement("script");
    script.src = "https://twemoji.maxcdn.com/2/twemoji.min.js?11.2";
    script.async = true;
    document.body.appendChild(script);

    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(`
        img.emoji {
            height: 1em;
            width: 1em;
            margin: 0 .05em 0 .1em;
            vertical-align: -0.1em;
        }
    `));
    document.head.appendChild(style);

    // FEEDYOU if no container provided, generate default one
    if (!container) {
        switch (props.theme && props.theme.template && props.theme.template.type) {
            case 'full-screen':
                renderFullScreenTemplate(props)
                break;
            default:
                renderExpandableTemplate(props)
        }
    } else {
        render(props, container) 
    }
}


export function MakeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 11; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function getStyleForTheme(theme: Theme, remoteConfig: boolean): string {
    switch (theme && theme.template && theme.template.type) {
      case 'expandable-bar':
        return ExpandableBarTheme(theme)      
      case 'full-screen':
        return FullScreenTheme(theme)  
      case 'expandable-knob':
        return ExpandableKnobTheme(theme)
    }

    // backward compatibility - knob is new default for remote config, old default is bar
    return remoteConfig ? ExpandableKnobTheme(theme) : ExpandableBarTheme(theme) 
}

const FullScreenTheme = (theme: Theme) =>`
  body {
    font-family: Helvetica, Arial;
    padding: 30px;

    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-align-items: flex-end;
    -ms-flex-align: end;
    align-items: flex-end;
  }

  .feedbot-logo {
    height: 10%;

    background-color: transparent;
    text-align: center;
    padding-top: 0px;
    padding-bottom: 5px;
  }

  .feedbot-logo img {
    max-height: 95%;
    max-width: 70%;
    padding-top: 15px;
    object-fit: contain;
  }
  
  @media (min-width: 768px) {
    .wc-adaptive-card {
      width: 398px;  
    }
  }

  .wc-adaptive-card {
    border-radius: 8px;
    padding: 2px 6px;
  }

  .feedbot-wrapper {
    background-color: transparent;
    width: 95%;
    max-width: 900px;
    min-width: 300px;
    height: 96%;
    max-height: 98.5%;
    min-height: 500px;

    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;

    position: absolute;
    bottom: 0;
  }

  .feedbot-wrapper .feedbot {
    position: relative;
    height: 90%;
  }

  .wc-message-from.wc-message-from-bot {
    visibility: hidden;
    height: 2px;
  }

  .wc-message-wrapper:not([data-activity-id='retry']) .wc-message-from {
    visibility: hidden;
  }

  .wc-message-wrapper:not([data-activity-id]) .wc-message-from {
    visibility: visible;
  }

  .wc-message-content {
    padding: 10px;
    border-radius: 13px;
  }

  .wc-message-from-bot .wc-message-content {
    color: #424242 !important;
  }

  .wc-carousel {
    margin-top: 10px;
  }

  .wc-suggested-actions .wc-hscroll > ul > li {
    margin: 6px;
  }

  .wc-message-pane .wc-suggested-actions {
    position: absolute;
    bottom: 0px;
    z-index: 10000;
    background-color: white;
  }

  .wc-message-pane.show-actions .wc-suggested-actions {
    height: 70px;
  }

  .feedbot-wrapper .wc-console {
    /*-webkit-box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.5);
    -moz-box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.5);
    box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.5);*/

    border-width: 0px;
    height: 70px;
  }

  .wc-message-pane.show-actions .wc-message-groups {
    top: 0px;
    transform: translateY(0px);
  }

  .wc-console.disable-input {
    background-color: white !important;
  }

  .feedbot .wc-suggested-actions .wc-hscroll > ul > li button, .wc-app .wc-card button {
    border-radius: 20px;
  }

  .feedbot .wc-suggested-actions .wc-hscroll > ul > li button:focus, .wc-console .wc-mic, .wc-console .wc-send, .wc-app .wc-card button {
    outline:0;
  }

  .wc-console .wc-mic, .wc-console .wc-send {
    top: 10px;
  }

  .wc-console input[type=text], .wc-console textarea {
    margin: 0px 15px;
  }

  .wc-textbox {
    border-radius: 13px;
    background-color: #eceff1;
    height: 70%;
    margin-bottom: 0px;
    top: 6px !important;
  }

  .wc-suggested-actions .wc-hscroll > ul {
    text-align: center;
    margin-top: 10px;
  }

  .wc-message-from-bot .wc-message-content {
   background-color: #f5f5f5;
  }

  .wc-message-from-bot svg.wc-message-callout path {
    fill: #f5f5f5;
  }

  .wc-suggested-actions .wc-hscroll > ul > li {
    max-width: 60%;
  }

  .wc-message-content {
   box-shadow: none;
  }

  .wc-message .wc-list {
    text-align: center;
  }

  .wc-app ::-webkit-scrollbar-thumb {
    background-color: #ececec;
  }

  .wc-app h1, .wc-app h2, .wc-app h3, .wc-app h4, .wc-app p, .wc-app ul, .wc-app ol {
    padding: 4px;
  }

  .wc-carousel button.scroll {
    background-color: #1f357a !important;
    border-width: 0px !important;
  }

  .feedbot .wc-suggested-actions .wc-hscroll > ul > li button, .wc-app .wc-card button {
    color: white !important;
    background-color: #1f357a !important;
    border-color: #1f357a !important;
  }

  .feedbot .wc-suggested-actions .wc-hscroll > ul > li button:active, .wc-app .wc-card button:active {
    color: #1f357a !important;
    background-color: white !important;
    border-color: #1f357a !important;
  }

  ${BaseTheme(theme)}
`


const ExpandableKnobTheme = (theme: Theme) => `
  body .feedbot-wrapper {
    bottom: calc(10px + 1vw);
    right: calc(10px + 1vw);
    border-radius: 15px;
  }

  body .feedbot-header {
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
  }

  body .feedbot-wrapper.collapsed {
    border-radius: 40px;
    width: 75px;
    min-width: auto;
    height: 75px;
  }

  body .feedbot-wrapper.collapsed .feedbot-header {
    border-radius: 40px;
    height: 100%;
    padding: 0px;

    background-image: url(${theme.template.iconUrl || 'https://cdn.feedyou.ai/webchat/message-icon.png'});
    background-size: 50px 50px;
    background-position: 12px 12px;
    background-repeat: no-repeat;

    text-indent: 999%;
    white-space: nowrap;
    overflow: hidden;
  }

  body .feedbot-wrapper {
    width: 420px;
    height: 565px;
  }

  ${ExpandableBarTheme(theme)}
`

const ExpandableBarTheme = (theme: Theme) => `
  .feedbot-header {
      z-index: 10;
      color: white;
      line-height: 30px;
      padding: 9px 8px 8px 16px;
      cursor: pointer;
      font-size: 1.1em;
      letter-spacing: 1px;
      display: flex;
  }

  .feedbot-header .feedbot-title {
      flex-grow: 1;
  }

  .feedbot-header .feedbot-minimize {
      width: 30px;
      text-align: center;
      color: white;
      font-weight: bolder;
      font-family: Verdana;
      font-size: 1.2em;
      line-height: 0.9em;
  }

  .feedbot-wrapper.collapsed .feedbot-minimize {
      display: none;
  }

  .feedbot-header .feedbot-minimize:hover {
      font-size: 1.5em;
      line-height: 0.8em;
  }

  .feedbot-header, .feedbot-wrapper {
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
  }

  .feedbot-wrapper {
    background-color: #fff;
    width: 450px;
    min-width: 275px;
    max-width: 90%;
    height: 700px;
    max-height: 90%;
    position: fixed;
    right: 5%;
    bottom: 0px;
    z-index: 10000;

    -webkit-box-shadow: 0px 0px 10px 0px rgba(167, 167, 167, 0.35);
    -moz-box-shadow: 0px 0px 10px 0px rgba(167, 167, 167, 0.35);
    box-shadow: 0px 0px 10px 0px rgba(167, 167, 167, 0.5);
  }

  .feedbot-wrapper.collapsed > .feedbot {
      display: none;
  }

  .feedbot-wrapper.collapsed {
      height: auto;
  }

  .feedbot-wrapper.collapsed .feedbot-header {
      padding-top: 10px;
  }

  .feedbot-wrapper .wc-adaptive-card, .feedbot-wrapper .wc-card {
    max-width: 337px !important;
  }

  ${BaseTheme(theme)}
`

const BaseTheme = (theme: Theme) => `
    body.feedbot-disabled div.feedbot {
        display: none;
    }

    .wc-app .wc-chatview-panel {
        top: 45px;
    }

    .wc-app .wc-message-groups {
        top: 0px;
        background-color: white;
    }

    .wc-app .wc-header {
        display: none;
    }

    .wc-app .wc-console {
        background-color: white;
    } 

    .wc-suggested-actions .wc-hscroll > ul > li button {
        color: white !important;
        background-color: ${theme.mainColor} !important;
        border-color: ${theme.mainColor} !important;
        border-radius: 20px;
        text-overflow: initial;
    }

    .wc-suggested-actions .wc-hscroll > ul > li button:hover {
        background-color: #ededed;
    }

    .wc-suggested-actions .wc-hscroll > ul > li button:active {
        color: ${theme.mainColor} !important;
        background-color: white !important;
        border-color: ${theme.mainColor} !important;
    }

    .wc-app .wc-card button {
        color: ${theme.mainColor};
    }

    .wc-app .wc-card button:hover {
        border-color: ${theme.mainColor};
        color: ${theme.mainColor};
    }

    .wc-app .wc-card button:active {
        background-color: ${theme.mainColor};
        border-color: ${theme.mainColor};
        color: #ffffff;
    }

    .wc-app .wc-message-from-me .wc-message-content {
        background-color: ${theme.mainColor};
    }

    .wc-app .wc-message-from-me svg.wc-message-callout path {
        fill: ${theme.mainColor};
    }

    /* TODO finish - no blank space below suggested actions when input disabled
    .feedbot-wrapper .wc-message-pane .wc-suggested-actions {
        position: absolute;
        bottom: 0px;
        z-index: 10000;
        background-color: white;
    }

    .feedbot-wrapper  .wc-message-pane.show-actions .wc-suggested-actions {
        height: 50px;
    }

    .feedbot-wrapper .wc-message-pane.show-actions .wc-message-groups {
        top: 0px;
        transform: translateY(0px);
    }

    .feedbot-wrapper .wc-message-pane.has-upload-button .wc-message-groups {
        transform: translateY(-30px);
    }

    .feedbot-wrapper .wc-console.disable-input .wc-textbox {
        display: none;
    }

    .feedbot-wrapper .wc-console.disable-input {
        background-color: white !important;
    }*/

    .feedbot-wrapper .wc-message-pane.show-actions .wc-message-groups {
        top: 0px;
        transform: translateY(-40px);
    }

    .feedbot-wrapper .wc-suggested-actions {
        background-color: transparent;
    }
    
    .feedbot-wrapper .wc-suggested-actions .wc-hscroll > ul > li {
        max-width: initial !important;
    }

    .feedbot-wrapper .wc-suggested-actions .wc-hscroll > ul {
        text-align: center;
    }

    .feedbot-wrapper .wc-suggested-actions .wc-hscroll > ul > li button:focus, .feedbot-wrapper .wc-console .wc-mic, .wc-console .wc-send, .feedbot-wrapper .wc-app .wc-card button {
        outline:0;
    }

    .feedbot-wrapper .wc-app .wc-card button {
        color: white !important;
        border-radius: 5px;
        background-color: ${theme.mainColor} !important;
        border-color: ${theme.mainColor} !important;
    }

    .feedbot-wrapper .wc-app .wc-card button:active {
        color: ${theme.mainColor} !important;
        background-color: white !important;
        border-color: ${theme.mainColor} !important;
    }

    .feedbot-wrapper .wc-message-pane.show-actions .wc-message-groups {
        top: 40px !important;
    }

    .feedbot-wrapper .wc-app .wc-card {
        background-color: #fff !important;
        border-width: 0px;
        border-radius: 5px;
    }
  
    .feedbot-wrapper .wc-message-content {
        box-shadow: none;
    }

    .feedbot-wrapper .wc-message-from-bot .wc-message-content {
        background-color: #f5f5f5;
    }

    .feedbot-wrapper .wc-message-from-bot svg.wc-message-callout path {
        fill: #f5f5f5;
    }

    .feedbot-wrapper .wc-card {
      border: 1px solid #d2dde5;
      max-width: 100%;
    }
    
    .feedbot-wrapper .wc-adaptive-card {
      max-width: 100%;
    }

    @media (max-width: 450px) {
      .feedbot-wrapper .wc-card {
        border: 1px solid #d2dde5;
        width: 198px; }
      .feedbot-wrapper .wc-adaptive-card {
        width: 214px; } }

    .wc-message-from.wc-message-from-bot {
        visibility: hidden;
        height: 2px;
    }

    .wc-message-wrapper:not([data-activity-id='retry']) .wc-message-from {
        visibility: hidden;
        height: 2px;
    }

    .wc-message-wrapper:not([data-activity-id]) .wc-message-from {
        visibility: visible;
    }

    .feedbot-wrapper .wc-message-content {
        padding: 10px;
        border-radius: 10px;
    }

    .feedbot-wrapper .wc-message-from-bot .wc-message-content {
        color: #424242 !important;
    }

    .feedbot-wrapper .wc-carousel {
        margin-top: 10px;
    }

    ${theme.customCss || ''}
  `