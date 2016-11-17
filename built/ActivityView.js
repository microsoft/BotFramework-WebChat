"use strict";
var React = require('react');
var Attachment_1 = require('./Attachment');
var Carousel_1 = require('./Carousel');
var FormattedText_1 = require('./FormattedText');
var Attachments = function (props) {
    if (props.attachments && props.attachments.length >= 1) {
        if (props.attachmentLayout === 'carousel')
            return React.createElement(Carousel_1.Carousel, {store: props.store, attachments: props.attachments, onImageLoad: props.onImageLoad});
        else
            return (React.createElement("div", {className: "wc-list"}, 
                " ", 
                props.attachments.map(function (attachment, index) {
                    return React.createElement(Attachment_1.AttachmentView, {key: index, store: props.store, attachment: attachment, onImageLoad: props.onImageLoad});
                }), 
                " "));
    }
    else
        return React.createElement("span", null);
};
exports.ActivityView = function (props) {
    switch (props.activity.type) {
        case 'message':
            return (React.createElement("div", null, 
                React.createElement(FormattedText_1.FormattedText, {text: props.activity.text, format: props.activity.textFormat}), 
                React.createElement(Attachments, {store: props.store, attachments: props.activity.attachments, attachmentLayout: props.activity.attachmentLayout, onImageLoad: props.onImageLoad})));
        case 'typing':
            return React.createElement("div", null, "TYPING");
    }
};
//# sourceMappingURL=ActivityView.js.map