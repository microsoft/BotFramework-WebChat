"use strict";
var React = require('react');
var Chat_1 = require('./Chat');
var nonEmpty = function (value, template) {
    if (typeof value === 'string' && value.length > 0)
        return template;
};
exports.AttachmentView = function (props) {
    if (!props.attachment)
        return;
    var attachment = props.attachment;
    var state = props.store.getState();
    var onClickButton = function (type, value) {
        switch (type) {
            case "imBack":
                Chat_1.sendMessage(props.store, value);
                break;
            case "postBack":
                Chat_1.sendPostBack(props.store, value);
                break;
            case "openUrl":
            case "signin":
                window.open(value);
                break;
            default:
                console.log("unknown button type");
        }
    };
    var buttons = function (buttons) { return buttons &&
        React.createElement("ul", {className: "wc-card-buttons"}, buttons.map(function (button) { return React.createElement("li", null, 
            React.createElement("button", {onClick: function () { return onClickButton(button.type, button.value); }}, button.title)
        ); })); };
    var imageWithOnLoad = function (url) {
        return React.createElement("img", {src: url, onLoad: function () { console.log("local onImageLoad"); props.onImageLoad(); }});
    };
    var audio = function (audioUrl, autoPlay, loop) {
        return React.createElement("audio", {src: audioUrl, autoPlay: autoPlay, controls: true, loop: loop});
    };
    var videoWithOnLoad = function (videoUrl, thumbnailUrl, autoPlay, loop) {
        return React.createElement("video", {src: videoUrl, poster: thumbnailUrl, autoPlay: autoPlay, controls: true, loop: loop, onLoadedMetadata: function () { console.log("local onVideoLoad"); props.onImageLoad(); }});
    };
    var attachedImage = function (images) {
        return images && imageWithOnLoad(images[0].url);
    };
    switch (attachment.contentType) {
        case "application/vnd.microsoft.card.hero":
            return (React.createElement("div", {className: 'wc-card hero'}, 
                attachedImage(attachment.content.images), 
                React.createElement("h1", null, attachment.content.title), 
                React.createElement("h2", null, attachment.content.subtitle), 
                React.createElement("p", null, attachment.content.text), 
                buttons(attachment.content.buttons)));
        case "application/vnd.microsoft.card.thumbnail":
            return (React.createElement("div", {className: 'wc-card thumbnail'}, 
                React.createElement("h1", null, attachment.content.title), 
                React.createElement("p", null, 
                    attachedImage(attachment.content.images), 
                    React.createElement("h2", null, attachment.content.subtitle), 
                    attachment.content.text), 
                buttons(attachment.content.buttons)));
        case "application/vnd.microsoft.card.video":
            var thumbnail;
            if (attachment.content.image)
                thumbnail = attachment.content.image.url;
            return (React.createElement("div", {className: 'wc-card video'}, 
                videoWithOnLoad(attachment.content.media[0].url, thumbnail, attachment.content.autostart, attachment.content.autoloop), 
                React.createElement("h1", null, attachment.content.title), 
                React.createElement("h2", null, attachment.content.subtitle), 
                React.createElement("p", null, attachment.content.text), 
                buttons(attachment.content.buttons)));
        case "application/vnd.microsoft.card.audio":
            return (React.createElement("div", {className: 'wc-card audio'}, 
                audio(attachment.content.media[0].url, attachment.content.autostart, attachment.content.autoloop), 
                React.createElement("h1", null, attachment.content.title), 
                React.createElement("h2", null, attachment.content.subtitle), 
                React.createElement("p", null, attachment.content.text), 
                buttons(attachment.content.buttons)));
        case "application/vnd.microsoft.card.signin":
            return (React.createElement("div", {className: 'wc-card signin'}, 
                React.createElement("h1", null, attachment.content.text), 
                buttons(attachment.content.buttons)));
        case "application/vnd.microsoft.card.receipt":
            return (React.createElement("div", {className: 'wc-card receipt'}, 
                React.createElement("table", null, 
                    React.createElement("thead", null, 
                        React.createElement("tr", null, 
                            React.createElement("th", {colSpan: 2}, attachment.content.title)
                        ), 
                        attachment.content.facts && attachment.content.facts.map(function (fact) { return React.createElement("tr", null, 
                            React.createElement("th", null, fact.key), 
                            React.createElement("th", null, fact.value)); })), 
                    React.createElement("tbody", null, attachment.content.items && attachment.content.items.map(function (item) {
                        return React.createElement("tr", null, 
                            React.createElement("td", null, 
                                item.image && imageWithOnLoad(item.image.url), 
                                React.createElement("span", null, item.title)), 
                            React.createElement("td", null, item.price));
                    })), 
                    React.createElement("tfoot", null, 
                        React.createElement("tr", null, 
                            React.createElement("td", null, "Tax"), 
                            React.createElement("td", null, attachment.content.tax)), 
                        React.createElement("tr", {className: "total"}, 
                            React.createElement("td", null, "Total"), 
                            React.createElement("td", null, attachment.content.total))))
            ));
        case "image/png":
        case "image/jpg":
        case "image/jpeg":
        case "image/gif":
            return imageWithOnLoad(attachment.contentUrl);
        case "audio/mpeg":
        case "audio/mp4":
            return audio(attachment.contentUrl);
        case "video/mp4":
            return videoWithOnLoad(attachment.contentUrl);
        default:
            return React.createElement("span", null);
    }
};
//# sourceMappingURL=Attachment.js.map