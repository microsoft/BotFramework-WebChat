"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var Store_1 = require('./Store');
var HistoryMessage_1 = require('./HistoryMessage');
var rxjs_1 = require('@reactivex/rxjs');
var History = (function (_super) {
    __extends(History, _super);
    function History(props) {
        _super.call(this, props);
        this.onMessageClicked = function (e, activity) {
            e.preventDefault();
            e.stopPropagation();
            Store_1.getStore().dispatch({ type: 'Select_Activity', selectedActivity: activity });
        };
    }
    History.prototype.componentWillMount = function () {
        var _this = this;
        this.storeUnsubscribe = Store_1.getStore().subscribe(function () {
            return _this.forceUpdate();
        });
    };
    History.prototype.componentDidMount = function () {
        var autoscrollSubscription = rxjs_1.Observable
            .fromEvent(this.scrollMe, 'scroll')
            .map(function (e) { return e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight; })
            .distinctUntilChanged()
            .subscribe(function (autoscroll) {
            return Store_1.getStore().dispatch({ type: 'Set_Autoscroll', autoscroll: autoscroll });
        });
    };
    History.prototype.componentWillUnmount = function () {
        this.autoscrollSubscription.unsubscribe();
        this.storeUnsubscribe();
    };
    History.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (Store_1.getState().history.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    };
    History.prototype.render = function () {
        var _this = this;
        var state = Store_1.getState();
        return (React.createElement("div", {className: "wc-message-groups", ref: function (ref) { return _this.scrollMe = ref; }}, 
            React.createElement("div", {className: "wc-message-group"}, state.history.activities
                .filter(function (activity) { return activity.type === "message" && (activity.from.id != state.connection.user.id || !activity.id); })
                .map(function (activity) {
                return React.createElement("div", {className: 'wc-message wc-message-from-' + (activity.from.id === state.connection.user.id ? 'me' : 'bot')}, 
                    React.createElement("div", {className: 'wc-message-content' + (_this.props.allowMessageSelection ? ' clickable' : '') + (activity === state.history.selectedActivity ? ' selected' : ''), onClick: function (e) { return _this.props.allowMessageSelection ? _this.onMessageClicked(e, activity) : undefined; }}, 
                        React.createElement("svg", {className: "wc-message-callout"}, 
                            React.createElement("path", {className: "point-left", d: "m0,0 h12 v10 z"}), 
                            React.createElement("path", {className: "point-right", d: "m0,10 v-10 h12 z"})), 
                        React.createElement(HistoryMessage_1.HistoryMessage, {activity: activity})), 
                    React.createElement("div", {className: "wc-message-from"}, activity.from.id === state.connection.user.id ? 'you' : activity.from.id));
            }))
        ));
    };
    return History;
}(React.Component));
exports.History = History;
// <Timestamp timestamp={ messagegroup.timestamp } />
// { activities.map(activity => <HistoryMessage message={ activity } actions={ this.props.actions }/>) }
//# sourceMappingURL=History.js.map