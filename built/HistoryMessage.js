"use strict";
var React = require('react');
var Attachment_1 = require('./Attachment');
var Carousel_1 = require('./Carousel');
var react_formattedtext_1 = require('react-formattedtext');
exports.HistoryMessage = function (props) {
    switch (props.activity.type) {
        case 'message':
            if (props.activity.attachments && props.activity.attachments.length >= 1) {
                if (props.activity.attachmentLayout === 'carousel' && props.activity.attachments.length > 1)
                    return React.createElement(Carousel_1.Carousel, {store: props.store, attachments: props.activity.attachments, onImageLoad: props.onImageLoad});
                else
                    return (React.createElement("div", null, props.activity.attachments.map(function (attachment) { return React.createElement(Attachment_1.AttachmentView, {store: props.store, attachment: attachment, onImageLoad: props.onImageLoad}); })));
            }
            else if (props.activity.text) {
                return React.createElement(react_formattedtext_1.FormattedText, {text: props.activity.text, format: props.activity.textFormat});
            }
            else {
                return React.createElement("span", null);
            }
        case 'typing':
            return React.createElement("div", null, "TYPING");
    }
};
//# sourceMappingURL=HistoryMessage.js.map