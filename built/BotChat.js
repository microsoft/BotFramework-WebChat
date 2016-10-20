"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var directLine_1 = require('./directLine');
var browserLine_1 = require('./browserLine');
var History_1 = require('./History');
var Shell_1 = require('./Shell');
var Store_1 = require('./Store');
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
                    Store_1.getStore().dispatch({ type: 'Subscribe_Host', host: event.source });
                    break;
                case "unsubscribe":
                    Store_1.getStore().dispatch({ type: 'Unsubscribe_Host' });
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
            var state = Store_1.getState();
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
        Store_1.getStore().dispatch({ type: 'Start_Connection', user: this.props.user, botConnection: bc });
        bc.connected$.filter(function (connected) { return connected === true; }).subscribe(function (connected) {
            Store_1.getStore().dispatch({ type: 'Connected_To_Bot' });
        });
        bc.activities$.subscribe(function (activity) { return Store_1.getStore().dispatch({ type: 'Receive_Message', activity: activity }); }, function (error) { return console.log("errors", error); });
        if (this.props.allowMessagesFrom) {
            console.log("adding event listener for messages from hosting web page");
            window.addEventListener("message", this.receiveBackchannelMessageFromHostingPage, false);
        }
        this.storeUnsubscribe = Store_1.getStore().subscribe(function () {
            return _this.forceUpdate();
        });
    };
    UI.prototype.componentWillUnmount = function () {
        this.storeUnsubscribe();
    };
    UI.prototype.render = function () {
        var state = Store_1.getState();
        console.log("BotChat state", state);
        return (React.createElement("div", {className: "wc-chatview-panel"}, 
            React.createElement("div", {className: "wc-header"}, 
                React.createElement("span", null, this.props.title || "WebChat")
            ), 
            React.createElement(History_1.History, {allowMessageSelection: this.props.allowMessageSelection}), 
            React.createElement(Shell_1.Shell, null)));
    };
    return UI;
}(React.Component));
exports.UI = UI;
//# sourceMappingURL=BotChat.js.map