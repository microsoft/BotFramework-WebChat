"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var redux_1 = require('redux');
var directLine_1 = require('./directLine');
var browserLine_1 = require('./browserLine');
var History_1 = require('./History');
var Shell_1 = require('./Shell');
var DebugView_1 = require('./DebugView');
var connection = function (state, action) {
    if (state === void 0) { state = {
        connected: false,
        botConnection: undefined,
        user: undefined,
        host: undefined
    }; }
    switch (action.type) {
        case 'Start_Connection':
            return { connected: false, botConnection: action.botConnection, user: action.user, host: state.host };
        case 'Connected_To_Bot':
            return { connected: true, botConnection: state.botConnection, user: state.user, host: state.host };
        case 'Subscribe_Host':
            return { connected: state.connected, botConnection: state.botConnection, user: state.user, host: action.host };
        case 'Unsubscribe_Host':
            return { connected: state.connected, botConnection: state.botConnection, user: state.user, host: undefined };
        default:
            return state;
    }
};
var shell = function (state, action) {
    if (state === void 0) { state = {
        text: '',
        enableSend: true
    }; }
    switch (action.type) {
        case 'Update_Shell_Text':
            return { text: action.text, enableSend: true };
        case 'Pre_Send_Shell_Text':
            return { text: state.text, enableSend: false };
        case 'Fail_Send_Shell_Text':
            return { text: state.text, enableSend: true };
        case 'Post_Send_Shell_Text':
            return { text: '', enableSend: true };
        default:
            return state;
    }
};
var history = function (state, action) {
    if (state === void 0) { state = {
        activities: [],
        autoscroll: true
    }; }
    switch (action.type) {
        case 'Receive_Message':
            return { activities: state.activities.concat([action.activity]), autoscroll: state.autoscroll };
        case 'Send_Message':
            return { activities: state.activities.concat([action.activity]), autoscroll: true };
        case 'Set_Autoscroll':
            return { activities: state.activities, autoscroll: action.autoscroll };
        default:
            return state;
    }
};
// Visibility state of the DebugView panel 
(function (DebugViewState) {
    DebugViewState[DebugViewState["disabled"] = 0] = "disabled";
    DebugViewState[DebugViewState["enabled"] = 1] = "enabled";
    DebugViewState[DebugViewState["visible"] = 2] = "visible"; // panel and toggle control are both visible
})(exports.DebugViewState || (exports.DebugViewState = {}));
var DebugViewState = exports.DebugViewState;
var debug = function (state, action) {
    if (state === void 0) { state = {
        viewState: DebugViewState.disabled,
        selectedActivity: null
    }; }
    switch (action.type) {
        case 'Set_Debug':
            return { viewState: action.viewState, selectedActivity: state.selectedActivity };
        case 'Toggle_Debug':
            if (state.viewState === DebugViewState.enabled)
                return { viewState: DebugViewState.visible, selectedActivity: state.selectedActivity };
            else if (state.viewState === DebugViewState.visible)
                return { viewState: DebugViewState.enabled, selectedActivity: state.selectedActivity };
            else
                return { viewState: state.viewState, selectedActivity: state.selectedActivity };
        case 'Select_Activity':
            return { viewState: state.viewState, selectedActivity: action.activity };
        default:
            return state;
    }
};
exports.store = redux_1.createStore(redux_1.combineReducers({
    shell: shell,
    connection: connection,
    history: history,
    debug: debug
}));
var UI = (function (_super) {
    __extends(UI, _super);
    function UI() {
        var _this = this;
        _super.call(this);
        this.receiveBackchannelMessageFromHostingPage = function (event) {
            if (!_this.props.allowMessagesFrom || _this.props.allowMessagesFrom.indexOf(event.origin) === -1) {
                console.log("Rejecting backchannel message from unknown source", event.source);
                return;
            }
            if (!event.data || !event.data.type) {
                console.log("Empty or typeless backchannel message from source", event.source);
                return;
            }
            console.log("Received backchannel message", event.data, "from", event.source);
            switch (event.data.type) {
                case "subscribe":
                    exports.store.dispatch({ type: 'Subscribe_Host', host: event.source });
                    break;
                case "unsubscribe":
                    exports.store.dispatch({ type: 'Unsubscribe_Host' });
                    break;
                case "send":
                    if (!event.data.contents) {
                        console.log("Backchannel message has no contents");
                        return;
                    }
                    break;
                default:
                    console.log("unknown message type", event.data.type);
                    return;
            }
            var state = exports.store.getState();
            state.connection.botConnection.postMessage("backchannel", state.connection.user, { backchannel: event.data })
                .retry(2)
                .subscribe(function (success) {
                console.log("backchannel message sent to bot");
            }, function (error) {
                console.log("failed to send backchannel message to bot");
            });
        };
    }
    UI.prototype.componentWillMount = function () {
        var _this = this;
        console.log("Starting BotChat", this.props);
        var bc = this.props.directLineDomain === "browser" ? new browserLine_1.BrowserLine() : new directLine_1.DirectLine({ secret: this.props.secret, token: this.props.token }, this.props.directLineDomain);
        exports.store.dispatch({ type: 'Start_Connection', user: this.props.user, botConnection: bc });
        bc.connected$.filter(function (connected) { return connected === true; }).subscribe(function (connected) {
            exports.store.dispatch({ type: 'Connected_To_Bot' });
        });
        var debug = this.props.debug && this.props.debug.toLowerCase();
        var debugViewState = DebugViewState.disabled;
        if (debug === DebugViewState[DebugViewState.enabled])
            debugViewState = DebugViewState.enabled;
        else if (debug === DebugViewState[DebugViewState.visible])
            debugViewState = DebugViewState.visible;
        exports.store.dispatch({ type: 'Set_Debug', viewState: debugViewState });
        bc.activities$.subscribe(function (activity) { return exports.store.dispatch({ type: 'Receive_Message', activity: activity }); }, function (error) { return console.log("errors", error); });
        if (this.props.allowMessagesFrom) {
            console.log("adding event listener for messages from hosting web page");
            window.addEventListener("message", this.receiveBackchannelMessageFromHostingPage, false);
        }
        exports.store.subscribe(function () {
            return _this.forceUpdate();
        });
    };
    UI.prototype.onClickDebug = function () {
        exports.store.dispatch({ type: 'Toggle_Debug' });
    };
    UI.prototype.render = function () {
        var state = exports.store.getState();
        console.log("BotChat state", state);
        return (React.createElement("div", {className: "wc-app"}, 
            React.createElement("div", {className: "wc-chatview-panel" + (state.debug.viewState === DebugViewState.visible ? " wc-withdebugview" : "")}, 
                React.createElement("div", {className: "wc-header"}, 
                    React.createElement("span", null, this.props.title || "WebChat"), 
                    React.createElement("div", {className: "wc-toggledebugview" + (state.debug.viewState !== DebugViewState.disabled ? "" : " wc-hidden"), onClick: this.onClickDebug}, 
                        React.createElement("svg", {width: "20", height: "20", viewBox: "0 0 1792 1792"}, 
                            React.createElement("rect", {id: "panel", height: "1152.159352", width: "642.020858", y: "384.053042", x: "959.042634"}), 
                            React.createElement("path", {id: "frame", d: "m224,1536l608,0l0,-1152l-640,0l0,1120q0,13 9.5,22.5t22.5,9.5zm1376,-32l0,-1120l-640,0l0,1152l608,0q13,0 22.5,-9.5t9.5,-22.5zm128,-1216l0,1216q0,66 -47,113t-113,47l-1344,0q-66,0 -113,-47t-47,-113l0,-1216q0,-66 47,-113t113,-47l1344,0q66,0 113,47t47,113z"}))
                    )), 
                React.createElement(History_1.History, null), 
                React.createElement(Shell_1.Shell, null)), 
            React.createElement("div", {className: "wc-debugview-panel" + (state.debug.viewState === DebugViewState.visible ? "" : " wc-hidden")}, 
                React.createElement("div", {className: "wc-header"}, 
                    React.createElement("span", null, "Debug")
                ), 
                React.createElement(DebugView_1.DebugView, {activity: state.debug.selectedActivity}))));
    };
    return UI;
}(React.Component));
exports.UI = UI;
//# sourceMappingURL=BotChat.js.map