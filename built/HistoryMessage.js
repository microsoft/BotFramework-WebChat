"use strict";
var React = require('react');
var Attachment_1 = require('./Attachment');
var Carousel_1 = require('./Carousel');
var FormattedText_1 = require('./FormattedText');
exports.HistoryMessage = function (props) {
    if (props.activity.attachments && props.activity.attachments.length >= 1) {
        if (props.activity.attachmentLayout === 'carousel' && props.activity.attachments.length > 1)
            return React.createElement(Carousel_1.Carousel, {attachments: props.activity.attachments});
        else
            return (React.createElement("div", null, props.activity.attachments.map(function (attachment) { return React.createElement(Attachment_1.AttachmentView, {attachment: attachment}); })));
    }
    else if (props.activity.text) {
        return React.createElement(FormattedText_1.FormattedText, {text: props.activity.text, format: props.activity.textFormat});
    }
    else {
        return React.createElement("span", null);
    }
};
//# sourceMappingURL=HistoryMessage.js.map