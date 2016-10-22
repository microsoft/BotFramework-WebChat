"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var ConsoleProvider_1 = require('./ConsoleProvider');
var rxjs_1 = require('@reactivex/rxjs');
var Store_1 = require('./Store');
var console$ = new rxjs_1.Subject();
var ConsoleProvider = (function () {
    function ConsoleProvider() {
        var _this = this;
        this.add = function (severity, message) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var entry = { severity: severity, message: message, args: args };
            console$.next(entry);
            console.log.apply(console, [message].concat(args));
        };
        this.log = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [ConsoleProvider_1.Severity.info, message].concat(args));
        };
        this.info = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [ConsoleProvider_1.Severity.info, message].concat(args));
        };
        this.trace = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [ConsoleProvider_1.Severity.trace, message].concat(args));
        };
        this.debug = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [ConsoleProvider_1.Severity.debug, message].concat(args));
        };
        this.warn = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [ConsoleProvider_1.Severity.warn, message].concat(args));
        };
        this.error = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [ConsoleProvider_1.Severity.error, message].concat(args));
        };
    }
    return ConsoleProvider;
}());
exports.ConsoleProvider = ConsoleProvider;
var ConsoleView = (function (_super) {
    __extends(ConsoleView, _super);
    function ConsoleView(props) {
        _super.call(this, props);
        this.state = { entries: [] };
    }
    ConsoleView.prototype.componentWillMount = function () {
        var _this = this;
        this.storeUnsubscribe = Store_1.getStore().subscribe(function () {
            return _this.forceUpdate();
        });
    };
    ConsoleView.prototype.componentDidMount = function () {
        var _this = this;
        this.autoscrollSubscription = rxjs_1.Observable
            .fromEvent(this.scrollMe, 'scroll')
            .map(function (e) { return e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight; })
            .distinctUntilChanged()
            .subscribe(function (autoscroll) {
            return Store_1.getStore().dispatch({ type: 'Set_Autoscroll', autoscroll: autoscroll });
        });
        this.consoleSubscription = console$.subscribe(function (entry) {
            var newState = { entries: _this.state.entries.concat([entry]) };
            _this.setState(newState);
        });
    };
    ConsoleView.prototype.componentWillUnmount = function () {
        this.autoscrollSubscription.unsubscribe();
        this.consoleSubscription.unsubscribe();
        this.storeUnsubscribe();
    };
    ConsoleView.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (Store_1.getState().history.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    };
    ConsoleView.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", {className: "wc-consoleview", ref: function (ref) { return _this.scrollMe = ref; }}, this.state.entries
            .map(function (entry, i) {
            return React.createElement("div", {className: 'wc-consoleview-' + ConsoleProvider_1.Severity[entry.severity], key: i}, textForEntry(entry));
        })));
    };
    return ConsoleView;
}(React.Component));
exports.ConsoleView = ConsoleView;
var textForEntry = function (entry) {
    var safeStringify = function (o, space) {
        if (space === void 0) { space = undefined; }
        var cache = [];
        return JSON.stringify(o, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    return;
                }
                cache.push(value);
            }
            return value;
        }, space);
    };
    var rest = '';
    if (entry.args && entry.args.length) {
        rest = ', ' + entry.args.filter(function (arg) { return !!arg; }).map(function (arg) { return safeStringify(arg); }).join(', ');
    }
    return "" + entry.message + rest;
};
//# sourceMappingURL=ConsoleView.js.map