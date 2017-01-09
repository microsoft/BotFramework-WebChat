import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps, konsole } from './Chat';
import { Activity, Message, User, IBotConnection } from './BotConnection';
import { DirectLine } from './directLine';

export type AppProps = ChatProps;

export const App = (props: AppProps, container: HTMLElement) => {
    konsole.log("BotChat.App props", props);
    ReactDOM.render(React.createElement(AppContainer, props), container);
} 

const AppContainer = (props: AppProps) =>
    <div className="wc-app">
        <div className="wc-app-left-container">
            <Chat { ...props } />
        </div>
    </div>;
