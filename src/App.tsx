import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps } from './Chat';
import { Activity, Message, IBotConnection } from './BotConnection';
import { DirectLine } from './directLine';
import 'core-js/shim';

export type AppProps = ChatProps & {
    allowMessagesFrom?: string[],
    onBackchannelMessage?: (backchannel: any) => void
}

export const App = (props: AppProps, container: HTMLElement) => {
    ReactDOM.render(React.createElement(AppContainer, props), container);
} 

const receiveBackchannelMessageFromHostingPage = (props: AppProps) => (event: MessageEvent) => {
    if (props.allowMessagesFrom.indexOf(event.origin) === -1) {
        console.log("Rejecting backchannel message from unknown source", event.source);
        return;
    }

    if (!event.data) {
        console.log("Empty backchannel message from source", event.source);
        return;
    }

    console.log("Received backchannel message", event.data, "from", event.source);

    props.botConnection.postMessage("backchannel", props.user, { backchannel: event.data })
    .retry(2)
    .subscribe(success => {
        console.log("backchannel message sent to bot");
    }, error => {
        console.log("failed to send backchannel message to bot");
    });
}

function isBackchannel(activity: Activity):activity is Message {
    return activity.type === "message" && activity.text === "backchannel" && activity.channelData && activity.channelData.backchannel;
}

const AppContainer = (props: AppProps) => {
    console.log("BotChat.App props", props);
    if (props.allowMessagesFrom) {
        console.log("adding event listener for messages from hosting web page");
        window.addEventListener("message", receiveBackchannelMessageFromHostingPage(props), false);
    }

    if (props.onBackchannelMessage) {
        console.log("adding event listener for messages to hosting web page");
        props = Object.assign({}, props, {
            botConnection: Object.assign({}, props.botConnection, {
                activity$: props.botConnection.activity$.do(activity => {
                        if (isBackchannel(activity)) {
                            this.props.onBackchannelMessage(activity.channelData.backchannel);
                        }
                    }).filter(activity => !isBackchannel(activity))
            })
        });
    }

    return (
        <div className="wc-app">
            <div className="wc-app-left-container">
                <Chat { ...(props as ChatProps) } />
            </div>
        </div>
    );
}
