"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var FormattedJSON_1 = require('./FormattedJSON');
var DebugView = (function (_super) {
    __extends(DebugView, _super);
    function DebugView() {
        _super.apply(this, arguments);
    }
    DebugView.prototype.render = function () {
        if (this.props.activity) {
            return (React.createElement("div", {className: "wc-debugview"}, 
                React.createElement("div", {className: "wc-debugview-json"}, 
                    React.createElement(FormattedJSON_1.FormattedJSON, {obj: this.props.activity})
                )
            ));
        }
        else {
            return (React.createElement("div", {className: "wc-debugview"}));
        }
    };
    return DebugView;
}(React.Component));
exports.DebugView = DebugView;
//# sourceMappingURL=DebugView.js.map