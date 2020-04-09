import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps } from './Chat';
import * as konsole from './Konsole';

export type Theme = {
    mainColor: string
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

    // FEEDYOU fetch DL token from bot when no token or secret found
    if (props.bot && props.bot.id && !props.botConnection && (!props.directLine || (!props.directLine.secret && !props.directLine.token))) {
        // TODO test IE11 https://github.com/matthew-andrews/isomorphic-fetch
        try {
            const response = await fetch(`https://${props.bot.id}.azurewebsites.net/auth/directline/token`, {
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
            props.directLine = {...(props.directLine || {}), token: body.token}

            if (body.testMode && window.location.hash !== '#feedbot-test-mode') {
                document.getElementsByTagName('body')[0].classList.add('feedbot-disabled')
                return
            } else {
                document.getElementsByTagName('body')[0].classList.add('feedbot-enabled')
            }
        } catch (err) {
            console.error('Token response error', err)
        }
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
        header.innerText = props.header ? (props.header.textWhenCollapsed || props.header.text || 'Chatbot') : 'Chatbot'
        header.onclick = () => {
            wrapper.classList.toggle('collapsed');
            if (!rendered) {
                header.innerText = (props.header && props.header.text) || 'Chatbot'
                render(props, container)
            }
        }
        wrapper.appendChild(header)

        wrapper.appendChild(container)
        document.body.appendChild( wrapper );

        if (props.autoExpandTimeout) {
            setTimeout(() => {
                if (wrapper.className.indexOf('collapsed') >= 0) {
                    header.click()
                }
            }, props.autoExpandTimeout)
        }
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
    body.feedbot-disabled div.feedbot {
        display: none;
    }

    .wc-app .wc-chatview-panel {
        top: 35px;
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

    .wc-app .wc-card button {
        color: ${theme.mainColor};
    }

    .wc-suggested-actions .wc-hscroll > ul > li button {
        color: ${theme.mainColor} !important;
        border-color: ${theme.mainColor} !important;
    }

    .wc-suggested-actions .wc-hscroll > ul > li button:hover {
        background-color: #ededed;
    }

    .wc-suggested-actions .wc-hscroll > ul > li button:active {
        color: white !important;
        background-color: ${theme.mainColor};
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
        min-width: 275px;
        max-width: 90%;
        height: 700px;
        max-height: 90%;
        position: fixed;
        right: 5%;
        bottom: 0px;
        z-index: 10000;

        -webkit-box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);
        -moz-box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);
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

    .feedbot-header {
        z-index: 10;
        color: white;
        line-height: 20px;
        padding: 8px 8px 8px 12px;
        cursor: pointer;
    }

    .feedbot-header, .feedbot-wrapper {
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }
    
    .wc-suggested-actions .wc-hscroll > ul > li {
        max-width: initial !important;
    }

    .wc-suggested-actions .wc-hscroll > ul {
        text-align: center;
    }

    body .wc-suggested-actions .wc-hscroll > ul > li button {
        color: white !important;
        background-color: ${theme.mainColor} !important;
        border-color: ${theme.mainColor} !important;
        border-radius: 20px;
        text-overflow: initial;
    }

    body .wc-suggested-actions .wc-hscroll > ul > li button:active {
        color: ${theme.mainColor} !important;
        background-color: white !important;
        border-color: ${theme.mainColor} !important;
    }

    .wc-suggested-actions .wc-hscroll > ul > li button:focus, .wc-console .wc-mic, .wc-console .wc-send, .wc-app .wc-card button {
        outline:0;
    }

    .wc-message-pane.show-actions .wc-message-groups {
        top: 40px !important;
    }

    @media (max-width: 450px) {
        .wc-card {
            border: 1px solid #d2dde5;
            width: 198px !important; 
        }
        .wc-adaptive-card {
            width: 214px !important;
        }
    }
  `