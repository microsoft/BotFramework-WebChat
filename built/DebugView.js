"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var Store_1 = require('./Store');
var DebugView = (function (_super) {
    __extends(DebugView, _super);
    function DebugView() {
        _super.apply(this, arguments);
    }
    DebugView.prototype.componentWillMount = function () {
        var _this = this;
        this.storeUnsubscribe = Store_1.getStore().subscribe(function () {
            return _this.forceUpdate();
        });
    };
    DebugView.prototype.componentWillUnmount = function () {
        this.storeUnsubscribe();
    };
    DebugView.prototype.render = function () {
        var state = Store_1.getState();
        return (React.createElement("div", {className: "wc-debugview"}, 
            React.createElement("div", {className: "wc-debugview-json"}, formatJSON(state.history.selectedActivity) || '')
        ));
    };
    return DebugView;
}(React.Component));
exports.DebugView = DebugView;
var formatJSON = function (obj) {
    if (!obj)
        return null;
    var json = JSON.stringify(obj, null, 2);
    // Hide ampersands we don't want replaced
    json = json.replace(/&(amp|apos|copy|gt|lt|nbsp|quot|#x?\d+|[\w\d]+);/g, '\x01');
    // Escape remaining ampersands and other HTML special characters
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Restore hidden ampersands
    json = json.replace(/\x01/g, '&');
    // Match all the JSON parts and add theming markup
    json = json.replace(/"(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, function (match) {
        // Default to "number"
        var cls = 'number';
        // Detect the type of the JSON part
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            }
            else {
                cls = 'string';
            }
        }
        else if (/true|false/.test(match)) {
            cls = 'boolean';
        }
        else if (/null/.test(match)) {
            cls = 'null';
        }
        if (cls === 'key') {
            // Color string content, not the quotes or colon delimiter
            var exec = /"(.*)":\s*/.exec(match);
            return "\"<span class=\"json-" + cls + "\">" + exec[1] + "</span>\": ";
        }
        else if (cls === 'string') {
            // Color string content, not the quotes
            var exec = /"(.*)"/.exec(match);
            return "\"<span class=\"json-" + cls + "\">" + exec[1] + "</span>\"";
        }
        else {
            return "<span class=\"json-" + cls + "\">" + match + "</span>";
        }
    });
    return React.createElement("span", {dangerouslySetInnerHTML: { __html: json }});
};
//# sourceMappingURL=DebugView.js.map