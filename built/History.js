"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var HistoryMessage_1 = require('./HistoryMessage');
var rxjs_1 = require('@reactivex/rxjs');
var History = (function (_super) {
    __extends(History, _super);
    function History(props) {
        var _this = this;
        _super.call(this, props);
        this.onImageLoad = function () {
            if (_this.props.store.getState().history.autoscroll)
                _this.scrollMe.scrollTop = _this.scrollMe.scrollHeight;
        };
    }
    History.prototype.componentDidMount = function () {
        var _this = this;
        this.autoscrollSubscription = rxjs_1.Observable
            .fromEvent(this.scrollMe, 'scroll')
            .map(function (e) { return e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight; })
            .distinctUntilChanged()
            .subscribe(function (autoscroll) {
            return _this.props.store.dispatch({ type: 'Set_Autoscroll', autoscroll: autoscroll });
        });
    };
    History.prototype.componentWillUnmount = function () {
        this.autoscrollSubscription.unsubscribe();
    };
    History.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.props.store.getState().history.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    };
    History.prototype.onActivitySelected = function (e, activity) {
        if (this.props.onActivitySelected) {
            e.preventDefault();
            e.stopPropagation();
            this.props.store.dispatch({ type: 'Select_Activity', selectedActivity: activity });
            this.props.onActivitySelected(activity);
        }
    };
    History.prototype.render = function () {
        var _this = this;
        var state = this.props.store.getState();
        return (React.createElement("div", {className: "wc-message-groups", ref: function (ref) { return _this.scrollMe = ref; }}, 
            React.createElement("div", {className: "wc-message-group"}, state.history.activities.map(function (activity, index) {
                return React.createElement("div", {key: index, className: 'wc-message wc-message-from-' + (activity.from.id === state.connection.user.id ? 'me' : 'bot')}, 
                    React.createElement("div", {className: 'wc-message-content' + (_this.props.onActivitySelected ? ' clickable' : '') + (activity === state.history.selectedActivity ? ' selected' : ''), onClick: function (e) { return _this.onActivitySelected(e, activity); }}, 
                        React.createElement("svg", {className: "wc-message-callout"}, 
                            React.createElement("path", {className: "point-left", d: "m0,0 h12 v10 z"}), 
                            React.createElement("path", {className: "point-right", d: "m0,10 v-10 h12 z"})), 
                        React.createElement(HistoryMessage_1.HistoryMessage, {store: _this.props.store, activity: activity, onImageLoad: _this.onImageLoad})), 
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