"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require('react');
var BotChat_1 = require('./BotChat');
var DebugView_1 = require('./DebugView');
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        _super.apply(this, arguments);
    }
    App.prototype.render = function () {
        return (React.createElement("div", {className: "wc-app"}, 
            React.createElement("div", {className: "wc-app-left-container"}, 
                React.createElement(BotChat_1.UI, __assign({}, this.props.uiProps))
            ), 
            React.createElement("div", {className: "wc-app-right-container"}, 
                React.createElement(DebugView_1.DebugView, null)
            )));
    };
    return App;
}(React.Component));
exports.App = App;
//# sourceMappingURL=App.js.map