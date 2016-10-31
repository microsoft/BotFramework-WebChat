"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
//import { BrowserLine } from './browserLine';
var History_1 = require('./History');
var Shell_1 = require('./Shell');
var Store_1 = require('./Store');
var Strings_1 = require('./Strings');
;
var Chat = (function (_super) {
    __extends(Chat, _super);
    function Chat(props) {
        var _this = this;
        _super.call(this, props);
        this.store = Store_1.createStore();
        this.typingTimers = {};
        console.log("BotChat.Chat props", props);
        this.store.dispatch({ type: 'Start_Connection', user: props.user, botConnection: props.botConnection });
        if (props.formatOptions)
            this.store.dispatch({ type: 'Set_Format_Options', options: props.formatOptions });
        this.store.dispatch({ type: 'Set_Localized_Strings', strings: Strings_1.strings(props.locale || window.navigator.language) });
        props.botConnection.start();
        this.connectedSubscription = props.botConnection.connected$.filter(function (connected) { return connected === true; }).subscribe(function (connected) {
            _this.store.dispatch({ type: 'Connected_To_Bot' });
        });
        this.activitySubscription = props.botConnection.activity$.subscribe(function (activity) { return _this.handleIncomingActivity(activity); }, function (error) { return console.log("errors", error); });
    }
    Chat.prototype.handleIncomingActivity = function (activity) {
        var _this = this;
        var state = this.store.getState();
        switch (activity.type) {
            case "message":
                if (activity.from.id === state.connection.user.id)
                    break;
                if (!(activity.text && activity.text.endsWith("//typing"))) {
                    if (!state.history.activities.find(function (a) { return a.id === activity.id; }))
                        this.store.dispatch({ type: 'Receive_Message', activity: activity });
                    break;
                }
                activity = Object.assign({}, activity, { type: 'typing' });
            case "typing":
                if (this.typingTimers[activity.from.id]) {
                    clearTimeout(this.typingTimers[activity.from.id]);
                    this.typingTimers[activity.from.id] = undefined;
                }
                this.store.dispatch({ type: 'Show_Typing', activity: activity });
                this.typingTimers[activity.from.id] = setTimeout(function () {
                    _this.typingTimers[activity.from.id] = undefined;
                    _this.store.dispatch({ type: 'Clear_Typing', from: activity.from });
                }, 3000);
                break;
        }
    };
    Chat.prototype.componentDidMount = function () {
        var _this = this;
        this.storeUnsubscribe = this.store.subscribe(function () {
            return _this.forceUpdate();
        });
    };
    Chat.prototype.componentWillUnmount = function () {
        this.activitySubscription.unsubscribe();
        this.connectedSubscription.unsubscribe();
        this.props.botConnection.end();
        this.storeUnsubscribe();
        for (var key in this.typingTimers) {
            clearTimeout(this.typingTimers[key]);
        }
    };
    Chat.prototype.render = function () {
        var state = this.store.getState();
        console.log("BotChat.Chat state", state);
        var header;
        if (state.format.options.showHeader)
            header =
                React.createElement("div", {className: "wc-header"}, 
                    React.createElement("span", null, state.format.strings.title)
                );
        return (React.createElement("div", {className: "wc-chatview-panel"}, 
            header, 
            React.createElement(History_1.History, {store: this.store, onActivitySelected: this.props.onActivitySelected}), 
            React.createElement(Shell_1.Shell, {store: this.store})));
    };
    return Chat;
}(React.Component));
exports.Chat = Chat;
exports.sendMessage = function (store, text) {
    var state = store.getState();
    var sendId = state.history.sendCounter;
    store.dispatch({ type: 'Send_Message', activity: {
            type: "message",
            text: text,
            from: state.connection.user,
            timestamp: Date.now().toString()
        } });
    exports.trySendMessage(store, sendId);
};
exports.trySendMessage = function (store, sendId, updateStatus) {
    if (updateStatus === void 0) { updateStatus = false; }
    if (updateStatus) {
        store.dispatch({ type: "Send_Message_Try", sendId: sendId });
    }
    var state = store.getState();
    var activity = state.history.activities.find(function (activity) { return activity["sendId"] === sendId; });
    state.connection.botConnection.postMessage(activity.text, state.connection.user)
        .subscribe(function (id) {
        console.log("success sending message", id);
        store.dispatch({ type: "Send_Message_Succeed", sendId: sendId, id: id });
    }, function (error) {
        console.log("failed to send message", error);
        // TODO: show an error under the message with "retry" link
        store.dispatch({ type: "Send_Message_Fail", sendId: sendId });
    });
};
exports.sendPostBack = function (store, text) {
    var state = store.getState();
    state.connection.botConnection.postMessage(text, state.connection.user)
        .subscribe(function (id) {
        console.log("success sending postBack", id);
    }, function (error) {
        console.log("failed to send postBack", error);
    });
};
//# sourceMappingURL=Chat.js.map