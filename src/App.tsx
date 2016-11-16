import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chat, ChatProps } from './Chat';
import { Activity, Message, User, IBotConnection } from './BotConnection';
import { DirectLine } from './directLine';
import 'core-js/shim';

export type AppProps = ChatProps
/*
//  experimental backchannel support 
& {
    allowMessagesFrom?: string[],
    onBackchannelMessage?: (backchannel: any) => void
}

function isBackchannel(activity: Activity): activity is Message {
    return activity.type === "message" && activity.text === "backchannel" && activity.channelData && activity.channelData.backchannel;
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

    props.botConnection.postActivity({
        type: "message",
        text: "backchannel",
        from: props.user,
        channelData: { backchannel: event.data }
    })
    .subscribe(success => {
        console.log("backchannel message sent to bot");
    }, error => {
        console.log("failed to send backchannel message to bot");
    });
}
// end experimental backchannel support 
*/

export const App = (props: AppProps, container: HTMLElement) => {
    console.log("BotChat.App props", props);
/*
    // experimental backchannel support
    if (props.allowMessagesFrom) {
        console.log("adding event listener for messages from hosting web page");
        window.addEventListener("message", receiveBackchannelMessageFromHostingPage(props), false);

        props.botConnection.activity$ = props.botConnection.activity$
            .do(activity => {
                if (props.onBackchannelMessage && isBackchannel(activity) && activity.from.id !== props.user.id) 
                    props.onBackchannelMessage(activity.channelData.backchannel);
                }
            )
            .filter(activity => !isBackchannel(activity));
    }
    // end experimental backchannel support
*/
    ReactDOM.render(React.createElement(AppContainer, props), container);
} 

const AppContainer = (props: AppProps) =>
    <div className="wc-app">
        <div className="wc-app-left-container">
            <Chat { ...(props as ChatProps) } />
        </div>
    </div>;
