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
        this.store.dispatch({ type: 'Receive_Message', activity: activity });
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
    };
    Chat.prototype.render = function () {
        var state = this.store.getState();
        console.log("BotChat.Chat starting state", state);
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
//# sourceMappingURL=Chat.js.map