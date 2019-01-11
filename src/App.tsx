import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps } from './Chat';
import * as konsole from './Konsole';

export type Theme = {
    mainColor: string
}

export type AppProps = ChatProps & {theme?: Theme};

export const App = (props: AppProps, container: HTMLElement) => {
    konsole.log("BotChat.App props", props);

    // FEEDYOU generate user ID if not present in props
    props.user = {...{id: MakeId(), name: 'Uživatel'}, ...props.user};
    props.showUploadButton = props.hasOwnProperty('showUploadButton') ? props.showUploadButton : false;
    props.resize = props.hasOwnProperty('resize') ? props.resize : 'detect';
    props.locale = props.hasOwnProperty('locale') ? props.locale : 'cs-cz';

    // FEEDYOU configurable theming
    if (props.theme) {
        const themeStyle = document.createElement('style');
        themeStyle.type = 'text/css';
        themeStyle.appendChild(document.createTextNode(ThemeTemplate(props.theme)));
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

    ReactDOM.render(React.createElement(AppContainer, props), container);
}

const AppContainer = (props: AppProps) =>
    <div className="wc-app">
        <Chat { ...props } />
    </div>;

export function MakeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 11; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

const ThemeTemplate = (theme: Theme) => `
    .wc-chatview-panel {
        top: 35px;
    }

    .wc-message-groups {
        top: 0px;
    }

    .wc-header {
        display: none;
    }

    .wc-card button {
        color: ${theme.mainColor};
    }

    .wc-card button:hover {
        border-color: ${theme.mainColor};
        color: ${theme.mainColor};
    }

    .wc-card button:active {
        background-color: ${theme.mainColor};
        border-color: ${theme.mainColor};
        color: #ffffff;
    }

    .wc-message-from-me .wc-message-content {
        background-color: ${theme.mainColor};
    }

    .wc-message-from-me svg.wc-message-callout path {
        fill: ${theme.mainColor};
    }
  `