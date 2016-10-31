"use strict";
var React = require('react');
exports.AttachmentView = function (props) {
    var state = props.store.getState();
    var onClickButton = function (type, value) {
        switch (type) {
            case "imBack":
            case "postBack":
                state.connection.botConnection.postMessage(value, state.connection.user)
                    .retry(2)
                    .subscribe(function () {
                    if (type === "imBack") {
                        props.store.dispatch({ type: 'Send_Message', activity: {
                                type: "message",
                                text: value,
                                from: { id: state.connection.user.id },
                                timestamp: Date.now().toString()
                            } });
                    }
                    else {
                        console.log("quietly posted message", value);
                    }
                }, function (error) {
                    console.log("failed to post message");
                });
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
        return React.createElement("img", {src: url, onLoad: function () { return props.onImageLoad(); }});
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
                                " /> }", 
                                React.createElement("span", null, item.title)), 
                            React.createElement("td", null, item.price));
                    })), 
                    React.createElement("tfoot", null, 
                        React.createElement("tr", null, 
                            React.createElement("td", null, "Tax"), 
                            React.createElement("td", null, props.attachment.content.tax)), 
                        React.createElement("tr", null, 
                            React.createElement("td", null, "Total"), 
                            React.createElement("td", null, props.attachment.content.total))))
            ));
        case "image/png":
        case "image/jpg":
        case "image/jpeg":
        case "image/gif":
            return imageWithOnLoad(props.attachment.contentUrl);
        default:
            return React.createElement("span", null);
    }
};
//# sourceMappingURL=Attachment.js.map