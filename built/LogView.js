"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var rxjs_1 = require('@reactivex/rxjs');
var Store_1 = require('./Store');
(function (Severity) {
    Severity[Severity["log"] = 0] = "log";
    Severity[Severity["info"] = 1] = "info";
    Severity[Severity["trace"] = 2] = "trace";
    Severity[Severity["debug"] = 3] = "debug";
    Severity[Severity["warn"] = 4] = "warn";
    Severity[Severity["error"] = 5] = "error";
})(exports.Severity || (exports.Severity = {}));
var Severity = exports.Severity;
var NullLogProvider = (function () {
    function NullLogProvider() {
    }
    NullLogProvider.prototype.add = function (severity, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
    };
    NullLogProvider.prototype.log = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
    };
    NullLogProvider.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
    };
    NullLogProvider.prototype.trace = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
    };
    NullLogProvider.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
    };
    NullLogProvider.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
    };
    NullLogProvider.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
    };
    return NullLogProvider;
}());
exports.NullLogProvider = NullLogProvider;
var BuiltinLogProvider = (function () {
    function BuiltinLogProvider() {
    }
    BuiltinLogProvider.prototype.add = function (severity, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        console[Severity[severity]].apply(console, [message].concat(args));
    };
    BuiltinLogProvider.prototype.log = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.log, message].concat(args));
    };
    BuiltinLogProvider.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.info, message].concat(args));
    };
    BuiltinLogProvider.prototype.trace = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.trace, message].concat(args));
    };
    BuiltinLogProvider.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.debug, message].concat(args));
    };
    BuiltinLogProvider.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.warn, message].concat(args));
    };
    BuiltinLogProvider.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.error, message].concat(args));
    };
    return BuiltinLogProvider;
}());
exports.BuiltinLogProvider = BuiltinLogProvider;
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
var LogViewProvider = (function () {
    function LogViewProvider() {
    }
    LogViewProvider.prototype.add = function (severity, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        message = safeStringify(message);
        if (args && args.length) {
            message = (message + ", ") + args.filter(function (arg) { return !!arg; }).map(function (arg) { return safeStringify(arg); }).join(', ');
        }
        var entry = { severity: severity, message: message };
        log$.next(entry);
        //console[Severity[severity]](message, ...args);
    };
    LogViewProvider.prototype.log = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.log, message].concat(args));
    };
    LogViewProvider.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.info, message].concat(args));
    };
    LogViewProvider.prototype.trace = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.trace, message].concat(args));
    };
    LogViewProvider.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.debug, message].concat(args));
    };
    LogViewProvider.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.warn, message].concat(args));
    };
    LogViewProvider.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.add.apply(this, [Severity.error, message].concat(args));
    };
    return LogViewProvider;
}());
exports.LogViewProvider = LogViewProvider;
var log$ = new rxjs_1.Subject();
var LogView = (function (_super) {
    __extends(LogView, _super);
    function LogView() {
        _super.call(this);
        this.state = { entries: [] };
    }
    LogView.prototype.componentWillMount = function () {
        var _this = this;
        this.storeUnsubscribe = Store_1.getStore().subscribe(function () {
            return _this.forceUpdate();
        });
    };
    LogView.prototype.componentDidMount = function () {
        var _this = this;
        this.autoscrollSubscription = rxjs_1.Observable
            .fromEvent(this.scrollMe, 'scroll')
            .map(function (e) { return e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight; })
            .distinctUntilChanged()
            .subscribe(function (autoscroll) {
            return Store_1.getStore().dispatch({ type: 'Set_Autoscroll', autoscroll: autoscroll });
        });
        this.consoleSubscription = log$.subscribe(function (entry) {
            var newState = { entries: _this.state.entries.concat([entry]) };
            _this.setState(newState);
        });
    };
    LogView.prototype.componentWillUnmount = function () {
        this.autoscrollSubscription.unsubscribe();
        this.consoleSubscription.unsubscribe();
        this.storeUnsubscribe();
    };
    LogView.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (Store_1.getState().log.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    };
    LogView.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", {className: "wc-consoleview", ref: function (ref) { return _this.scrollMe = ref; }}, this.state.entries.map(function (entry, i) {
            return React.createElement("div", {className: 'wc-consoleview-' + Severity[entry.severity], key: i}, 
                "`$", 
                entry.message, 
                "`");
        })));
    };
    return LogView;
}(React.Component));
exports.LogView = LogView;
//# sourceMappingURL=LogView.js.map