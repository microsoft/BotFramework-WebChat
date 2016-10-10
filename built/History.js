"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var BotChat_1 = require('./BotChat');
var HistoryMessage_1 = require('./HistoryMessage');
var rxjs_1 = require('@reactivex/rxjs');
var History = (function (_super) {
    __extends(History, _super);
    function History() {
        _super.call(this);
        this.onMessageClicked = function (e, activity) {
            if (BotChat_1.store.getState().debug.viewState === BotChat_1.DebugViewState.visible) {
                e.preventDefault();
                e.stopPropagation();
                BotChat_1.store.dispatch({ type: 'Select_Activity', activity: activity });
            }
        };
    }
    History.prototype.componentWillMount = function () {
        var _this = this;
        BotChat_1.store.subscribe(function () {
            return _this.forceUpdate();
        });
    };
    History.prototype.componentDidMount = function () {
        var autoscrollSubscription = rxjs_1.Observable
            .fromEvent(this.scrollMe, 'scroll')
            .map(function (e) { return e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight; })
            .distinctUntilChanged()
            .subscribe(function (autoscroll) {
            return BotChat_1.store.dispatch({ type: 'Set_Autoscroll', autoscroll: autoscroll });
        });
    };
    History.prototype.componentWillUnmount = function () {
        this.autoscrollSubscription.unsubscribe();
    };
    History.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (BotChat_1.store.getState().history.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    };
    History.prototype.render = function () {
        var _this = this;
        var state = BotChat_1.store.getState();
        return (React.createElement("div", {className: "wc-message-groups", ref: function (ref) { return _this.scrollMe = ref; }}, 
            React.createElement("div", {className: "wc-message-group"}, state.history.activities
                .filter(function (activity) { return activity.type === "message" && (activity.from.id != state.connection.userId || !activity.id); })
                .map(function (activity) {
                return React.createElement("div", {className: 'wc-message wc-message-from-' + (activity.from.id === state.connection.userId ? 'me' : 'bot')}, 
                    React.createElement("div", {className: 'wc-message-content' + (state.debug.viewState === BotChat_1.DebugViewState.visible ? ' clickable' : '') + (activity === state.debug.selectedActivity ? ' selected' : ''), onClick: function (e) { return _this.onMessageClicked(e, activity); }}, 
                        React.createElement("svg", {className: "wc-message-callout"}, 
                            React.createElement("path", {className: "point-left", d: "m0,0 h12 v10 z"}), 
                            React.createElement("path", {className: "point-right", d: "m0,10 v-10 h12 z"})), 
                        React.createElement(HistoryMessage_1.HistoryMessage, {activity: activity})), 
                    React.createElement("div", {className: "wc-message-from"}, activity.from.id === state.connection.userId ? 'you' : activity.from.id));
            }))
        ));
    };
    return History;
}(React.Component));
exports.History = History;
// <Timestamp timestamp={ messagegroup.timestamp } />
// { activities.map(activity => <HistoryMessage message={ activity } actions={ this.props.actions }/>) }
//# sourceMappingURL=History.js.map