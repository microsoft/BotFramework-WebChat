"use strict";
(function (Severity) {
    Severity[Severity["info"] = 0] = "info";
    Severity[Severity["trace"] = 1] = "trace";
    Severity[Severity["debug"] = 2] = "debug";
    Severity[Severity["warn"] = 3] = "warn";
    Severity[Severity["error"] = 4] = "error";
})(exports.Severity || (exports.Severity = {}));
var Severity = exports.Severity;
var BuiltinConsoleProvider = (function () {
    function BuiltinConsoleProvider() {
        var _this = this;
        this.add = function (severity, message) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            console[Severity[severity]].apply(console, [message].concat(args));
        };
        this.log = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [Severity.info, message].concat(args));
        };
        this.info = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [Severity.info, message].concat(args));
        };
        this.trace = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [Severity.trace, message].concat(args));
        };
        this.debug = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [Severity.debug, message].concat(args));
        };
        this.warn = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [Severity.warn, message].concat(args));
        };
        this.error = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            _this.add.apply(_this, [Severity.error, message].concat(args));
        };
    }
    return BuiltinConsoleProvider;
}());
exports.BuiltinConsoleProvider = BuiltinConsoleProvider;
var NullConsoleProvider = (function () {
    function NullConsoleProvider() {
        this.add = function (severity, message) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
        };
        this.log = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
        };
        this.info = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
        };
        this.trace = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
        };
        this.debug = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
        };
        this.warn = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
        };
        this.error = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
        };
    }
    return NullConsoleProvider;
}());
exports.NullConsoleProvider = NullConsoleProvider;
//# sourceMappingURL=ConsoleProvider.js.map