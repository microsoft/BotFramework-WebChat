import * as React from "react";
import * as ReactDOM from "react-dom";
import { Chat, ChatProps } from "./Chat";
import {
  render,
  renderExpandableTemplate,
  renderFullScreenTemplate,
} from "./AppService";
import { DirectLine } from "botframework-directlinejs";
import * as konsole from "./Konsole";
import * as rgb2hex from "rgb2hex"

export type Theme = {
  mainColor: string;
  template: any;
  customCss?: string;
  showSignature?: boolean,
  enableScreenshotUpload?: boolean
};

export type AppProps = ChatProps & {
  theme?: Theme;
  header?: { textWhenCollapsed?: string; text: string };
  channel?: { index?: number, id?: string },
  autoExpandTimeout?: number;
};

export const App = async (props: AppProps, container?: HTMLElement) => {
  konsole.log("BotChat.App props", props);

  // FEEDYOU generate user ID if not present in props, make sure its always string
  props.user = {
    name: "Uživatel",
    ...props.user,
    id: props.user && props.user.id ? "" + props.user.id : MakeId(),
  };

  // FEEDYOU fetch DL token from bot when no token or secret found
  const remoteConfig =
    props.bot &&
    props.bot.id &&
    !props.botConnection &&
    (!props.directLine ||
      (!props.directLine.secret && !props.directLine.token));
  if (remoteConfig) {
    // TODO test IE11 https://github.com/matthew-andrews/isomorphic-fetch
    try {
      const response = await fetch(
        `https://${props.bot.id}.azurewebsites.net/webchat/config`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: JSON.stringify({
            user: props.user,
            channel: props.channel,
            referrer: window.location.href
          }),
        }
      );
      const body = await response.json();
      console.log("Token response", body);

      props.botConnection = new DirectLine({
        ...(props.directLine || {}),
        token: body.token,
      });
      delete props.directLine;

      // TODO configurable template system based on config
      const config = body.config;
      const alwaysVisible = config && config.visibility === 'always'
      const neverVisible = config && config.visibility === 'never'
      if (!config || neverVisible || (!alwaysVisible && body.testMode && window.location.hash !== "#feedbot-test-mode")) {
        document
          .getElementsByTagName("body")[0]
          .classList.add("feedbot-disabled");
        return;
      } else {
        document
          .getElementsByTagName("body")[0]
          .classList.add("feedbot-enabled");
      }

      if (config && config.template) {
        props.theme = {
          ...props.theme,
          template: {
            ...config.template,
            ...(props.theme ? props.theme.template : {}),
          },
        };

        if (config.mainColor) {
          props.theme.mainColor = config.mainColor;
        }

        props.theme.showSignature = !config.hideSignature

        props.theme.enableScreenshotUpload = !!config.enableScreenshotUpload

        if (config.showInput === "auto") {
          props.disableInputWhenNotNeeded = true;
        }

        if (config.template.autoExpandTimeout > 0) {
          props.autoExpandTimeout = config.template.autoExpandTimeout;
        }

        if (config.customCss) {
          props.theme.customCss = config.customCss;
        }

        if (config.template.headerText) {
          props.header = {
            ...(props.header || {}),
            text: config.template.headerText,
          };
        }

        if (config.template.collapsedHeaderText) {
          props.header = {
            ...(props.header || { text: "Chatbot" }),
            textWhenCollapsed: config.template.collapsedHeaderText,
          };
        }
      }
    } catch (err) {
      console.error("Token response error", err);
      return;
    }
  }

  // FEEDYOU props defaults
  props.showUploadButton = props.hasOwnProperty("showUploadButton")
    ? props.showUploadButton
    : false;
  props.resize = props.hasOwnProperty("resize") ? props.resize : "detect";
  props.locale = props.hasOwnProperty("locale") ? props.locale : "cs-cz";

  // FEEDYOU configurable theming
  if (props.theme || !container) {
    const theme = { mainColor: "#D83838", ...props.theme };
    const themeStyle = document.createElement("style");
    themeStyle.type = "text/css";
    themeStyle.appendChild(
      document.createTextNode(getStyleForTheme(theme, remoteConfig))
    );
    document.head.appendChild(themeStyle);
  }

  // FEEDYOU use twemoji to make emoji compatible
  const script = document.createElement("script");
  script.src = "https://twemoji.maxcdn.com/2/twemoji.min.js?11.2";
  script.async = true;
  document.body.appendChild(script);

  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(
    document.createTextNode(`
        img.emoji {
            height: 1em;
            width: 1em;
            margin: 0 .05em 0 .1em;
            vertical-align: -0.1em;
        }
    `)
  );
  document.head.appendChild(style);

  // FEEDYOU if no container provided, generate default one
  if (!container) {
    switch (props.theme && props.theme.template && props.theme.template.type) {
      case "full-screen":
        renderFullScreenTemplate(props);
        break;
      default:
        renderExpandableTemplate(props);
    }
  } else {
    render(props, container);
  }
};

export function MakeId() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 11; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function getStyleForTheme(theme: Theme, remoteConfig: boolean): string {
  switch (theme && theme.template && theme.template.type) {
    case "expandable-bar":
      return ExpandableBarTheme(theme);
    case "full-screen":
      return FullScreenTheme(theme);
    case "expandable-knob":
      return ExpandableKnobTheme(theme);
    case "sidebar":
      return Sidebar(theme);
  }

  // backward compatibility - knob is new default for remote config, old default is bar
  return remoteConfig ? ExpandableKnobTheme(theme) : ExpandableBarTheme(theme);
}

function getSidebarBackgroundColor(theme: Theme) {
  return '#e1e1e1'

  // TODO make background tint configurable in theme
  /*const color = theme.mainColor
  if(color.startsWith("rgb")){
    return rgb2hex(color).hex
  }
  return color*/
}

export function isSafari() {
  return !(navigator.userAgent.indexOf("Safari") !== -1 && navigator.userAgent.indexOf("Chrome") !== -1);
}

const FullScreenTheme = (theme: Theme) => `
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
    top: 10px !important;
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
`;

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

  body .feedbot-wrapper .wc-chatview-panel {
    border-bottom-right-radius: 15px;
    border-bottom-left-radius: 15px;
  }

  .wc-app .wc-console {
    background-color: white;
    border-width: 0px;
    border-top: 1px solid #dbdee1;
  } 

  .wc-app .wc-console .wc-textbox {
    left: 20px;
  } 

  .wc-app .wc-console.has-upload-button .wc-textbox {
    left: 48px;
  }

  .wc-app .wc-console .wc-send {
    top: 4px;
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

    background-image: url(${(theme.template && theme.template.iconUrl)
    ? theme.template.iconUrl
    : "https://cdn.feedyou.ai/webchat/message-icon.png"
  });
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

  .wc-upload-screenshot {
    display: none !important;
  }

  ${theme.enableScreenshotUpload && !isSafari() ? `
    .wc-upload-screenshot {
      display: inline-block !important;
      position: absolute !important;
      left: 46px !important;
      height: 40px !important;
      background-color: transparent !important;
      border: none !important;
      color: #8a8a8a;
      padding: 0;
    }
    .wc-upload-screenshot svg {
      margin: 9px 6px !important;
      width: 32px;
      height: 22px;
    }
    .wc-console.has-upload-button .wc-textbox {
      left: 96px !important;
    }
  ` : ''}

  .feedbot-wrapper.collapsed .feedbot-signature {
    display: none;
  }

  .feedbot-wrapper .feedbot-signature {
    position: absolute;
    bottom: -22px;
    font-size: 13px;
    right: 11px;
    opacity: 0.50;
    font-family: "Roboto", sans-serif;
    display: flex;
    align-items: center;
    -webkit-transition: opacity 0.3s ease-in-out;
    -moz-transition: opacity 0.3s ease-in-out;
    -ms-transition: opacity 0.3s ease-in-out;
    -o-transition: opacity 0.3s ease-in-out;
    transition: opacity 0.3s ease-in-out;
  }

  .feedbot-wrapper .feedbot-signature:hover {
    opacity: 0.80;
  }

  .feedbot-signature a {
    transition: 0.3s;
    color: black;
    text-decoration: none;
    height: 19px;
    margin-left: 3px;
    display: flex;
  }

  .feedbot-signature a:hover {
    cursor: pointer;
  }
  .feedbot-signature a img {
    height: 20px;
    position: relative;
    top: -1px;
  }

  ${ExpandableBarTheme(theme)}
`;

const Sidebar = (theme: Theme) => `
  ${ExpandableKnobTheme(theme)}

  body .feedbot-wrapper:not(.collapsed) .feedbot-header {
    height: 35px;
    width: 35px;
    position: absolute;
    right: 10px;
    top: 20px;

    border-radius: 40px;
    padding: 0px;

    text-indent: 999%;
    white-space: nowrap;
    overflow: hidden;

    background-image: url('https://feedyou.blob.core.windows.net/webchat/times-solid.svg');
    background-repeat: no-repeat;
    background-size: 15px;
    background-position: center center;    

  }

  .feedbot-wrapper.collapsed .feedbot-header {
    padding-top: 0;
  }

  body .feedbot-wrapper:not(.collapsed) {
    height: 100vh;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }

  body .feedbot-wrapper .wc-chatview-panel  {
    border-radius: 0;
    ${theme.showSignature ? 'bottom: 14px;' : ''}
    top: 0;
  }

  .feedbot-wrapper .wc-suggested-actions {
    ${theme.showSignature ? 'bottom: 68px;' : ''}
  }

  body .wc-app .wc-console {
    border-radius: 16px;
    margin: 0 12px 10px;
    border: 1px solid #dbdee1;
  } 


  body .feedbot-wrapper.collapsed {
    bottom: 30px;
    right: 30px;
  }

  /* slightly transparent fallback */
  .feedbot-wrapper {
    max-height: 100%;
    background: rgb(255, 255, 255);
  }

  /* if backdrop support: very transparent and blurred */
  @supports ((-webkit-backdrop-filter: blur(40px)) or (backdrop-filter: blur(40px))) {
    .feedbot-wrapper {
      max-height: 100%;
      background: linear-gradient(45deg, ${getSidebarBackgroundColor(theme)}33,  #E1E1E1CE);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
    }
  }

  .wc-app .wc-message-groups {
    background-color: transparent;
  }

  .wc-message-callout {
    display: none;
  }

  .feedbot-wrapper .wc-adaptive-card, .feedbot-wrapper .wc-card {
    max-width: 300px !important;
  }

  .wc-message-content {
    padding: 12px 14px;
    line-height: 1.25em;
  }

  .wc-message-from-bot .wc-message-content {
    border-radius: 0 16px 16px 16px;
    padding: 14px;
    background: linear-gradient(-45deg, rgba(255,255,255,0.5), rgba(255,255,255,0.9)) !important;
  }

  .wc-message-from-me .wc-message-content {
    border-radius: 16px 0 16px 16px;
    padding: 14px;
  }

  .format-markdown + div {
    margin-top: 0 !important;
  }

  .feedbot-wrapper .feedbot-signature {
    bottom: 0px;
    left: 0px;
    height: 24px;
    justify-content: center;
    text-shadow: 1px 1px 7px rgb(255 255 255 / 50%);
  }
  
  .feedbot-signature a {
    height: unset;
  }

  .feedbot-signature a img {
    height: 22px;
  }
  
`;

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
      font-family: 'Roboto', sans-serif;
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
    z-index: 100000;

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

  .wc-carousel .wc-hscroll > ul > li > .wc-card {
    height: 100%;
  }

  .wc-carousel .wc-hscroll > ul > li > .wc-card > div > .ac-container > .ac-container .ac-image{
    border-radius: 5px 5px 0 0;
  }
`;

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

        flex: auto;
        padding: 5px 16px;
    }

    .feedbot-wrapper .wc-app .wc-card button, .feedbot-wrapper .wc-app .wc-card button > div {
        text-overflow: initial !important;
        white-space: initial !important;
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
        background-color: transparent;
        border-width: 0px;
        border-radius: 5px;
    }

    .feedbot-wrapper .wc-app .wc-carousel .wc-card {
        background-color: #fff !important;
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

    .wc-list .ac-container {
      outline: none !important;
    }
    
    .feedbot-wrapper .wc-adaptive-card {
      max-width: 100%;
    }

    .wc-list.tiles .ac-actionSet {
      flex-direction: row !important;
      flex-wrap: wrap;
      justify-content: center;
    }

    .wc-list.tiles .ac-container {
      padding-top: 0px;
      margin-top: -5px;
    }

    .wc-list.tiles .ac-pushButton {
      flex-basis: 44% !important;
      min-height: 120px !important;
      margin: 3% !important;
      flex-direction: column !important;
      transition: 0.3s;
      position: relative;
      padding: 16px;
      top: 0;
    }

    .wc-list.tiles .ac-pushButton:hover {
      top: -3px;
      filter: brightness(90%);
    }

    .feedbot-wrapper .wc-app .wc-list.tiles .wc-card .ac-pushButton:active {
      background-color: ${theme.mainColor}A0 !important;
      color: white !important;
    }

    .wc-list.tiles .ac-pushButton img {
      width: 36px !important;
      height: 36px !important;
      margin-right: 0px !important;
      margin-bottom: 10px !important;
    }

    .wc-list.tiles .ac-pushButton div {
      overflow: unset !important; 
      text-overflow: unset !important; 
      white-space: unset !important;
    }

    @media (max-width: 450px) {
      .feedbot-wrapper .wc-card {
        border: 1px solid #d2dde5;
        width: 198px; 
      }
      .feedbot-wrapper .wc-list.tiles .wc-card {
        border: none;
        width: 100%; 
      }

      .wc-list.tiles .ac-pushButton {
        min-height: 95px !important;
      }

      .wc-list.tiles .ac-container {
        padding: 0 !important;
        margin-top: 0 !important;
      }

      .feedbot-wrapper .wc-adaptive-card {
        width: 214px; 
      } 
    }

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
        margin-top: 10px !important;
    }

    .wc-carousel .wc-hscroll ul {
      display: flex;
      align-items: stretch;
    }
  
      .wc-carousel .wc-hscroll > ul > li > .wc-card > div {
        height: 100%;
      }
  
      .wc-carousel .wc-hscroll > ul > li > .wc-card > div > .ac-container {
        padding: 0 !important;
        height: 100%;
        justify-content: space-between !important;
      }
    
    .wc-carousel .wc-hscroll > ul > li > .wc-card > div > .ac-container > .ac-container .ac-image{
      border-radius: 8px 8px 0 0;
    }

    .wc-carousel .wc-hscroll > ul > li > .wc-card > div > .ac-container > .ac-container .ac-textBlock{
      padding: 0 20px;
    }

    .wc-carousel .wc-hscroll > ul > li > .wc-card > div .ac-actionSet{
      margin: 4px 20px 12px !important;
    }

    .feedbot-signature {
      display: none;
    }

    ${theme.customCss || ""}
  `;
