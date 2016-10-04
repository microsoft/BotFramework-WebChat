"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var HistoryMessage_1 = require('./HistoryMessage');
var History = (function (_super) {
    __extends(History, _super);
    function History(props) {
        _super.call(this);
    }
    History.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.props.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    };
    History.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", {className: "wc-message-groups", ref: function (ref) { return _this.scrollMe = ref; }, onScroll: function (e) { return _this.props.actions.setAutoscroll(e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight); }}, 
            React.createElement("div", {className: "wc-message-group"}, this.props.activities
                .filter(function (activity) { return activity.type === "message" && (activity.from.id != _this.props.userId || !activity.id); })
                .map(function (activity) {
                return React.createElement("div", {className: 'wc-message wc-message-from-' + (activity.from.id === _this.props.userId ? 'me' : 'bot')}, 
                    React.createElement("div", {className: 'wc-message-content' + (_this.props.debuggerVisible ? ' clickable' : '') + (activity === _this.props.selectedActivity ? ' selected' : ''), onClick: _this.props.debuggerVisible ? function (e) { _this.props.actions.onMessageClicked(activity, e); } : function () { }}, 
                        React.createElement("svg", {className: "wc-message-callout"}, 
                            React.createElement("path", {className: "point-left", d: "m0,0 h12 v10 z"}), 
                            React.createElement("path", {className: "point-right", d: "m0,10 v-10 h12 z"})), 
                        React.createElement(HistoryMessage_1.HistoryMessage, {activity: activity, actions: _this.props.actions})), 
                    React.createElement("div", {className: "wc-message-from"}, activity.from.id === _this.props.userId ? 'you' : activity.from.id));
            }))
        ));
    };
    return History;
}(React.Component));
exports.History = History;
// <Timestamp timestamp={ messagegroup.timestamp } />
// { activities.map(activity => <HistoryMessage message={ activity } actions={ this.props.actions }/>) }
//# sourceMappingURL=History.js.map