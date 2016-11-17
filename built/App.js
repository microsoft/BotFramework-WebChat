"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require('react');
var ReactDOM = require('react-dom');
var Chat_1 = require('./Chat');
require('core-js/shim');
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
        konsole.log("Rejecting backchannel message from unknown source", event.source);
        return;
    }

    if (!event.data) {
        konsole.log("Empty backchannel message from source", event.source);
        return;
    }

    konsole.log("Received backchannel message", event.data, "from", event.source);

    props.botConnection.postActivity({
        type: "message",
        text: "backchannel",
        from: props.user,
        channelData: { backchannel: event.data }
    })
    .subscribe(success => {
        konsole.log("backchannel message sent to bot");
    }, error => {
        konsole.log("failed to send backchannel message to bot");
    });
}
// end experimental backchannel support
*/
exports.App = function (props, container) {
    Chat_1.konsole.log("BotChat.App props", props);
    /*
        // experimental backchannel support
        if (props.allowMessagesFrom) {
            konsole.log("adding event listener for messages from hosting web page");
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
};
var AppContainer = function (props) {
    return React.createElement("div", {className: "wc-app"}, 
        React.createElement("div", {className: "wc-app-left-container"}, 
            React.createElement(Chat_1.Chat, __assign({}, props))
        )
    );
};
//# sourceMappingURL=App.js.map