import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps } from './Chat';
import * as konsole from './Konsole';

export type Theme = {
    mainColor: string
}

export type AppProps = ChatProps & {theme?: Theme, header?: {textWhenCollapsed?: string, text: string}};

export const App = (props: AppProps, container?: HTMLElement) => {
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

    // FEEDYOU if no container provided, generate default one
    if (!container) {
        let rendered = false
        container = document.createElement( 'div' );
        container.className = 'feedbot'
        
        const wrapper = document.createElement( 'div' );
        wrapper.className = 'feedbot-wrapper collapsed'

        const header = document.createElement('div')
        header.className='feedbot-header'
        header.style.backgroundColor = props.theme && props.theme.mainColor ? props.theme.mainColor : '#e51836'
        header.innerText = props.header.textWhenCollapsed || props.header.text || 'Chatbot'
        header.onclick = () => {
            wrapper.classList.toggle('collapsed');
            if (!rendered) {
                header.innerText = props.header.text || 'Chatbot'
                render(props, container)
            }
        }
        wrapper.appendChild(header)

        wrapper.appendChild(container)
        document.body.appendChild( wrapper );

        // TODO autoExpandTimeout
    } else {
        render(props, container) 
    }
}

const render = (props: AppProps, container?: HTMLElement) => {
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
    .wc-app .wc-chatview-panel {
        top: 35px;
    }

    .wc-app .wc-message-groups {
        top: 0px;
    }

    .wc-app .wc-header {
        display: none;
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

    .feedbot-wrapper {
        background-color: #fff;
        width: 450px;
        max-width: 90%;
        height: 700px;
        max-height: 75%;
        position: fixed;
        right: 5%;
        bottom: 0px;
    }
    
    .feedbot-wrapper.collapsed > .feedbot {
        display: none;
    }

    .feedbot-wrapper.collapsed {
        height: auto;
    }

    .feedbot-header {
        z-index: 10;
        color: white;
        height: 20px;
        line-height: 20px;
        padding: 8px;
        cursor: pointer;
    }

    .feedbot-header, .feedbot-wrapper {
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }
  `