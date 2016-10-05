"use strict";
var React = require('react');
exports.AttachmentView = function (props) {
    var buttonActions = {
        "imBack": props.actions.buttonImBack,
        "openUrl": props.actions.buttonOpenUrl,
        "postBack": props.actions.buttonPostBack,
        "signin": props.actions.buttonSignIn
    };
    // REVIEW we need to make sure each button.type is one of these
    var buttons = function (buttons) { return buttons &&
        React.createElement("ul", {className: "wc-card-buttons"}, buttons.map(function (button) { return React.createElement("li", null, 
            React.createElement("button", {onClick: function () { return buttonActions[button.type](button.value); }}, button.title)
        ); })); };
    var images = function (images) { return images &&
        React.createElement("div", null, images.map(function (image) { return React.createElement("img", {src: image.url}); })); };
    switch (props.attachment.contentType) {
        case "application/vnd.microsoft.card.hero":
            return (React.createElement("div", {className: 'wc-card hero'}, 
                images(props.attachment.content.images), 
                React.createElement("h1", null, props.attachment.content.title), 
                React.createElement("h2", null, props.attachment.content.subtitle), 
                React.createElement("p", null, props.attachment.content.text), 
                buttons(props.attachment.content.buttons)));
        case "application/vnd.microsoft.card.thumbnail":
            return (React.createElement("div", {className: 'wc-card thumbnail'}, 
                React.createElement("h1", null, props.attachment.content.title), 
                React.createElement("p", null, 
                    images(props.attachment.content.images), 
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
                                item.image && React.createElement("img", {src: item.image.url}), 
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
            return React.createElement("img", {src: props.attachment.contentUrl});
        default:
            return React.createElement("span", null);
    }
};
//# sourceMappingURL=Attachment.js.map