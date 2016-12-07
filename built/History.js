"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ActivityView_1 = require("./ActivityView");
var Chat_1 = require("./Chat");
var History = (function (_super) {
    __extends(History, _super);
    function History(props) {
        var _this = _super.call(this, props) || this;
        _this.scrollToBottom = true;
        _this.atBottomThreshold = 80;
        _this.autoscroll = function () {
            if (_this.scrollToBottom && (_this.scrollMe.scrollHeight > _this.scrollMe.offsetHeight))
                _this.scrollMe.scrollTop = _this.scrollMe.scrollHeight - _this.scrollMe.offsetHeight;
        };
        _this.scrollEventListener = function () { return _this.checkBottom(); };
        _this.resizeListener = function () { return _this.checkBottom(); };
        return _this;
    }
    History.prototype.componentDidMount = function () {
        this.scrollMe.addEventListener('scroll', this.scrollEventListener);
        window.addEventListener('resize', this.resizeListener);
    };
    History.prototype.componentWillUnmount = function () {
        this.scrollMe.removeEventListener('scroll', this.scrollEventListener);
        window.removeEventListener('resize', this.resizeListener);
    };
    History.prototype.checkBottom = function () {
        var offBottom = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight - this.scrollMe.scrollTop;
        this.scrollToBottom = offBottom <= this.atBottomThreshold;
    };
    History.prototype.componentDidUpdate = function () {
        this.autoscroll();
    };
    History.prototype.selectActivity = function (activity) {
        if (this.props.selectActivity)
            this.props.selectActivity(activity);
    };
    History.prototype.suitableInterval = function (current, next) {
        return Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;
    };
    History.prototype.onClickRetry = function (e, activity) {
        e.preventDefault();
        e.stopPropagation();
        Chat_1.trySendMessage(this.props.store, activity.channelData.clientActivityId, true);
    };
    History.prototype.render = function () {
        var _this = this;
        var state = this.props.store.getState();
        var activities = state.history.activities;
        var wrappedActivities = activities.map(function (activity, index) {
            var timeLine;
            switch (activity.id) {
                case undefined:
                    timeLine = React.createElement("span", null, state.format.strings.messageSending);
                    break;
                case null:
                    timeLine = React.createElement("span", null, state.format.strings.messageFailed);
                    break;
                case "retry":
                    timeLine =
                        React.createElement("span", null,
                            state.format.strings.messageFailed,
                            ' ',
                            React.createElement("a", { href: ".", onClick: function (e) { return _this.onClickRetry(e, activity); } }, state.format.strings.messageRetry));
                    break;
                default:
                    var sent = void 0;
                    if (index === activities.length - 1 || (index + 1 < activities.length && _this.suitableInterval(activity, activities[index + 1])))
                        sent = state.format.strings.timeSent.replace('%1', (new Date(activity.timestamp)).toLocaleTimeString());
                    timeLine = React.createElement("span", null,
                        activity.from.name || activity.from.id,
                        sent);
                    break;
            }
            return (React.createElement("div", { key: index, className: "wc-message-wrapper" + (_this.props.selectActivity ? ' clickable' : ''), onClick: function (e) { return _this.selectActivity(activity); } },
                React.createElement("div", { className: 'wc-message wc-message-from-' + (activity.from.id === state.connection.user.id ? 'me' : 'bot') },
                    React.createElement("div", { className: 'wc-message-content' + (activity === state.history.selectedActivity ? ' selected' : '') },
                        React.createElement("svg", { className: "wc-message-callout" },
                            React.createElement("path", { className: "point-left", d: "m0,6 l6 6 v-12 z" }),
                            React.createElement("path", { className: "point-right", d: "m6,6 l-6 6 v-12 z" })),
                        React.createElement(ActivityView_1.ActivityView, { store: _this.props.store, activity: activity, onImageLoad: _this.autoscroll })),
                    React.createElement("div", { className: "wc-message-from" }, timeLine))));
        });
        return (React.createElement("div", { className: "wc-message-groups", ref: function (ref) { return _this.scrollMe = ref; } },
            React.createElement("div", { className: "wc-message-group" },
                React.createElement("div", { className: "wc-message-group-content" }, wrappedActivities))));
    };
    return History;
}(React.Component));
exports.History = History;
//# sourceMappingURL=History.js.map