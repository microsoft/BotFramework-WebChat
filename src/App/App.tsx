import 'core-js'
import * as React from 'react'
import { ChatProps } from '../Chat'
import { renderWebchatApp } from './renderWebchatApp'
import { DirectLine } from 'botframework-directlinejs'
import * as konsole from '../Konsole'
import { getFeedyouParam, setFeedyouParam } from '../FeedyouParams'
import { getStyleForTheme, Theme } from '../themes'
import { generateUserId } from '../utils/generateUserId'

export type AppProps = ChatProps & {
  theme?: Theme;
  header?: { textWhenCollapsed?: string; text: string, extraHtml?: Element };
  channel?: { index?: number, id?: string };
  autoExpandTimeout?: number;
  enableScreenshotUpload?: boolean;
  openUrlTarget: "new" | "same" | "same-domain";
  persist?: "user" | "conversation" | "none";
  manualCloseExpireInMinutes?: number
};

export const App = async (props: AppProps, container?: HTMLElement) => {
  konsole.log("BotChat.App props", props);

  // FEEDYOU generate user ID if not present in props, make sure its always string
  props.user = {
    name: "Uživatel",
    ...props.user
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
      konsole.log("Feedyou WebChat init", body);

      setFeedyouParam("openUrlTarget", props.openUrlTarget || (body.config && body.config.openUrlTarget))

      if(props.typingDelay) {
        setFeedyouParam("typingDelay", props.typingDelay.toString())
      }
      
      props.persist = props.persist || (body.config && body.config.persist)
      if((props.persist === "user" || props.persist === "conversation") && localStorage.feedbotUserId){
        props.user.id = localStorage.feedbotUserId
      }
    
      const directLine = props.directLine || {}
      if(props.persist === "conversation"){
        const conversationExpiration = parseInt(sessionStorage.feedbotConversationExpiration)
        const isConversationExpired = !conversationExpiration || Date.now() >= conversationExpiration
        if (isConversationExpired) {
          sessionStorage.removeItem('feedbotDirectLineToken')
          sessionStorage.removeItem('feedbotConversationId')
        }

        if (sessionStorage.feedbotDirectLineToken && sessionStorage.feedbotConversationId) {
          body.token = sessionStorage.feedbotDirectLineToken
          directLine.conversationId = sessionStorage.feedbotConversationId
          directLine.webSocket = false
        } else {
          sessionStorage.feedbotDirectLineToken = body.token
          sessionStorage.feedbotConversationExpiration = String(Date.now() + 60 * 60 * 1000)
        }
        
        if (!getFeedyouParam("openUrlTarget")) {
          setFeedyouParam("openUrlTarget", "same-domain")
        }
      }

      props.botConnection = new DirectLine({
        ...directLine,
        token: body.token,
      });
      delete props.directLine;

      // TODO configurable template system based on config
      const config = body.config;
      const alwaysVisible = config && config.visibility === 'always'
      const neverVisible = config && config.visibility === 'never'
      const fullscreen = props.theme && props.theme.template && props.theme.template.type === 'full-screen'
      if ((!config && !fullscreen) || neverVisible || (!alwaysVisible && body.testMode && window.location.hash !== "#feedbot-test-mode")) {
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
        props.theme.signature = config.signature || {}

        props.theme.enableScreenshotUpload = !!config.enableScreenshotUpload

        if (config.showInput && !props.hasOwnProperty("disableInputWhenNotNeeded")) {
          props.disableInputWhenNotNeeded = config.showInput !== "always"
        }
        
        if (config.locale && !props.hasOwnProperty("locale")) {
          props.locale = config.locale
        }

        if (config.template.autoExpandTimeout > 0 && !props.hasOwnProperty("autoExpandTimeout")) {
          props.autoExpandTimeout = config.template.autoExpandTimeout;
        }

        if (config.introDialogId) {
          props.introDialog = {id: config.introDialogId}
        }

        if (config.userData) {
          props.userData = config.userData.reduce(
            (data: {[key: string]: any}, row: {storage: string, value: string}) => {
              if (row.storage && row.value && !data[row.storage]) {
                data[row.storage] = row.value
                return data
              }
            }, props.userData || {})
        }

        if (config.customCss) {
          props.theme.customCss = config.customCss;
        }

        if(config.customScript && !props.hasOwnProperty("customScript")) {
          const customScriptTag = document.createElement("script");
          customScriptTag.appendChild(document.createTextNode(config.customScript))
          document.body.appendChild(customScriptTag);
        }

        if (config.template.headerText) {
          props.header = {
            ...(props.header || {}),
            text: config.template.headerText,
          };
        }

        if(config.consolePlaceholder){
          props.consolePlaceholder = config.consolePlaceholder
        }

        if (config.template.collapsedHeaderText) {
          props.header = {
            ...(props.header || { text: "Chatbot" }),
            textWhenCollapsed: config.template.collapsedHeaderText,
          };
        }
      }
    } catch (err) {
      console.error("WebChat init error", err);
      return;
    }
  }

  props.user.id = props.user.id ? String(props.user.id) : generateUserId()
  // localStorage is undefined in IE for file:// testing: https://stackoverflow.com/a/3392301/10467064
  if(localStorage) localStorage.feedbotUserId = props.user.id

  // FEEDYOU props defaults
  props.showUploadButton = props.hasOwnProperty("showUploadButton")
    ? props.showUploadButton
    : false;
  props.resize = props.hasOwnProperty("resize") ? props.resize : "detect";
  props.locale = props.hasOwnProperty("locale") ? props.locale : "cs-cz";

  // FEEDYOU configurable theming
  if (props.theme || !container) {
    const theme = { mainColor: "#D83838", ...props.theme };
    props.theme.enableScreenshotUpload = !!props.enableScreenshotUpload
    const themeStyle = document.createElement("style");
    themeStyle.type = "text/css";
    themeStyle.appendChild(
      document.createTextNode(getStyleForTheme(theme, remoteConfig))
    );
    document.body.appendChild(themeStyle);
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

	renderWebchatApp(props, container)
};

