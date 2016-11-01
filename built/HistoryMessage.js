"use strict";
var React = require('react');
var Attachment_1 = require('./Attachment');
var Carousel_1 = require('./Carousel');
var FormattedText_1 = require('./FormattedText');
exports.CarouselOrList = function (props) {
    if (props.attachments && props.attachments.length >= 1) {
        if (props.attachmentLayout === 'carousel')
            return React.createElement(Carousel_1.Carousel, {store: props.store, attachments: props.attachments, onImageLoad: props.onImageLoad});
        else
            return (React.createElement("div", null, 
                " ", 
                props.attachments.map(function (attachment) {
                    return React.createElement(Attachment_1.AttachmentView, {store: props.store, attachment: attachment, onImageLoad: props.onImageLoad});
                }), 
                " "));
    }
    else
        return React.createElement("span", null);
};
exports.ActivityView = function (props) {
    switch (props.activity.type) {
        case 'message':
            var text = props.activity.text ?
                React.createElement(FormattedText_1.FormattedText, {text: props.activity.text, format: props.activity.textFormat}) :
                React.createElement("span", null);
            console.log("text", text);
            return (React.createElement("div", null, 
                text, 
                React.createElement(exports.CarouselOrList, {store: props.store, attachments: props.activity.attachments, attachmentLayout: props.activity.attachmentLayout, onImageLoad: props.onImageLoad})));
        case 'typing':
            return React.createElement("div", null, "TYPING");
    }
};
//# sourceMappingURL=HistoryMessage.js.map