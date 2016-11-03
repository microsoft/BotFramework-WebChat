"use strict";
var React = require('react');
var Chat_1 = require('./Chat');
var nonEmpty = function (value, template) {
    if (typeof value === 'string' && value.length > 0)
        return template;
};
exports.AttachmentView = function (props) {
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
    var attachedImage = function (images) {
        return images && imageWithOnLoad(images[0].url);
    };
    switch (props.attachment.contentType) {
        case "application/vnd.microsoft.card.hero":
            return (React.createElement("div", {className: 'wc-card hero'}, 
                attachedImage(props.attachment.content.images), 
                React.createElement("h1", null, props.attachment.content.title), 
                React.createElement("h2", null, props.attachment.content.subtitle), 
                React.createElement("p", null, props.attachment.content.text), 
                buttons(props.attachment.content.buttons)));
        case "application/vnd.microsoft.card.thumbnail":
            return (React.createElement("div", {className: 'wc-card thumbnail'}, 
                React.createElement("h1", null, props.attachment.content.title), 
                React.createElement("p", null, 
                    attachedImage(props.attachment.content.images), 
                    React.createElement("h2", null, props.attachment.content.subtitle), 
                    props.attachment.content.text), 
                buttons(props.attachment.content.buttons)));
        case "application/vnd.microsoft.card.signin":
            return (React.createElement("div", {className: 'wc-card signin'}, 
                React.createElement("h1", null, props.attachment.content.text), 
                buttons(props.attachment.content.buttons)));
        case "application/vnd.microsoft.card.receipt":
            return (React.createElement("div", {className: 'wc-card receipt'}, 
                React.createElement("table", null, 
                    React.createElement("thead", null, 
                        React.createElement("tr", null, 
                            React.createElement("th", {colSpan: 2}, props.attachment.content.title)
                        ), 
                        props.attachment.content.facts && props.attachment.content.facts.map(function (fact) { return React.createElement("tr", null, 
                            React.createElement("th", null, fact.key), 
                            React.createElement("th", null, fact.value)); })), 
                    React.createElement("tbody", null, props.attachment.content.items && props.attachment.content.items.map(function (item) {
                        return React.createElement("tr", null, 
                            React.createElement("td", null, 
                                item.image && imageWithOnLoad(item.image.url), 
                                React.createElement("span", null, item.title)), 
                            React.createElement("td", null, item.price));
                    })), 
                    React.createElement("tfoot", null, 
                        React.createElement("tr", null, 
                            React.createElement("td", null, "Tax"), 
                            React.createElement("td", null, props.attachment.content.tax)), 
                        React.createElement("tr", {className: "total"}, 
                            React.createElement("td", null, "Total"), 
                            React.createElement("td", null, props.attachment.content.total))))
            ));
        case "image/png":
        case "image/jpg":
        case "image/jpeg":
        case "image/gif":
            return imageWithOnLoad(props.attachment.contentUrl);
        case "video/mp4":
            return (React.createElement("div", {className: 'wc-card video'}, 
                React.createElement("video", {src: props.attachment.contentUrl, poster: props.attachment.thumbnailUrl, controls: true}), 
                nonEmpty(props.attachment.name, React.createElement("h1", null, props.attachment.name))));
        default:
            return React.createElement("span", null);
    }
};
//# sourceMappingURL=Attachment.js.map