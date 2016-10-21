"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require('react');
var Chat_1 = require('./Chat');
exports.App = function (props) {
    return React.createElement("div", {className: "wc-app"}, 
        React.createElement("div", {className: "wc-app-left-container"}, 
            React.createElement(Chat_1.Chat, __assign({}, props))
        )
    );
};
//# sourceMappingURL=App.js.map