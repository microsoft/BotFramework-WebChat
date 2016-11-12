"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var ActivityView_1 = require('./ActivityView');
var History = (function (_super) {
    __extends(History, _super);
    function History(props) {
        _super.call(this, props);
        this.scrollToBottom = true;
    }
    History.prototype.componentWillUpdate = function () {
        this.scrollToBottom = this.scrollMe.scrollTop + this.scrollMe.offsetHeight >= this.scrollMe.scrollHeight;
    };
    History.prototype.componentDidUpdate = function () {
        this.autoscroll();
    };
    History.prototype.selectActivity = function (activity) {
        if (this.props.selectActivity)
            this.props.selectActivity(activity);
    };
    History.prototype.onImageLoad = function () {
        this.autoscroll();
    };
    History.prototype.autoscroll = function () {
        if (this.scrollToBottom)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
    };
    History.prototype.suitableInterval = function (current, next) {
        return Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;
    };
    History.prototype.render = function () {
        var _this = this;
        var state = this.props.store.getState();
        var activities = state.history.activities;
        var wrappedActivities = activities.map(function (activity, index) {
            var timeLine;
            if (index === activities.length - 1 || (index + 1 < activities.length && _this.suitableInterval(activity, activities[index + 1]))) {
                timeLine = " at " + (new Date(activity.timestamp)).toLocaleTimeString();
            }
            return (React.createElement("div", {key: index, className: "wc-message-wrapper" + (_this.props.selectActivity ? ' clickable' : ''), onClick: function (e) { return _this.selectActivity(activity); }}, 
                React.createElement("div", {className: 'wc-message wc-message-from-' + (activity.from.id === state.connection.user.id ? 'me' : 'bot')}, 
                    React.createElement("div", {className: 'wc-message-content' + (activity === state.history.selectedActivity ? ' selected' : '')}, 
                        React.createElement("svg", {className: "wc-message-callout"}, 
                            React.createElement("path", {className: "point-left", d: "m0,6 l6 6 v-12 z"}), 
                            React.createElement("path", {className: "point-right", d: "m6,6 l-6 6 v-12 z"})), 
                        React.createElement(ActivityView_1.ActivityView, {store: _this.props.store, activity: activity, onImageLoad: function () { return _this.onImageLoad; }})), 
                    React.createElement("div", {className: "wc-message-from"}, 
                        activity.from.name || activity.from.id, 
                        timeLine))
            ));
        });
        return (React.createElement("div", {className: "wc-message-groups", ref: function (ref) { return _this.scrollMe = ref; }}, 
            React.createElement("div", {className: "wc-message-group"}, 
                React.createElement("div", {className: "wc-message-group-content"}, wrappedActivities)
            )
        ));
    };
    return History;
}(React.Component));
exports.History = History;
//# sourceMappingURL=History.js.map