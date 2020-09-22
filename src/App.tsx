import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps } from './Chat';
import { DirectLine } from 'botframework-directlinejs';
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

            props.botConnection = new DirectLine({...(props.directLine || {}), token: body.token});
            delete props.directLine

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
                header.innerHTML = '<span class="feedbot-title">'+((props.header && props.header.text) || 'Chatbot')+'</span><a onclick="return false;" class="feedbot-minimize" href="#">_</a>'
                render(props, container)
            }

            // when closed manually, store flag to do not open automatically after reload
            localStorage && (localStorage.feedbotClosed = wrapper.classList.contains('collapsed'))
        }
        wrapper.appendChild(header)

        wrapper.appendChild(container)
        document.body.appendChild( wrapper );
        
        if (props.autoExpandTimeout && (!localStorage || localStorage.feedbotClosed !== 'true') && window.matchMedia && window.matchMedia("(min-width: 1024px)").matches) {
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

        -webkit-box-shadow: 0px 0px 10px 0px rgba(167, 167, 167, 0.25);
        -moz-box-shadow: 0px 0px 10px 0px rgba(167, 167, 167, 0.25);
        box-shadow: 0px 0px 10px 0px rgba(167, 167, 167, 0.25);
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

    @media (max-width: 450px) {
        .feedbot-wrapper .wc-card {
            border: 1px solid #d2dde5;
            width: 198px !important; 
        }
        .feedbot-wrapper .wc-adaptive-card {
            width: 214px !important;
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
        margin-top: 10px;
    }
  `