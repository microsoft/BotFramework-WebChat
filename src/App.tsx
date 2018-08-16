import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps } from './Chat';
import * as konsole from './Konsole';

export type AppProps = ChatProps;

export const App = (props: AppProps, container: HTMLElement) => {
    konsole.log("BotChat.App props", props);

    // FEEDYOU generate user ID if not present in props
    props.user = {...{id: makeid(), name: 'Uživatel'}, ...props.user};
    props.showUploadButton = props.hasOwnProperty('showUploadButton') ? props.showUploadButton : false;
    props.resize = props.hasOwnProperty('resize') ? props.resize : 'detect';
    props.locale = props.hasOwnProperty('locale') ? props.locale : 'cs-cz';

    ReactDOM.render(React.createElement(AppContainer, props), container);
}

const AppContainer = (props: AppProps) =>
    <div className="wc-app">
        <Chat { ...props } />
    </div>;

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 11; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}