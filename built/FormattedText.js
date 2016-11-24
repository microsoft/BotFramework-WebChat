"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var Marked = require('marked');
var React = require('react');
var He = require('he');
var FormattedText = (function (_super) {
    __extends(FormattedText, _super);
    function FormattedText(props) {
        _super.call(this, props);
    }
    FormattedText.prototype.shouldComponentUpdate = function (nextProps) {
        // I don't love this, but it is fast and it works.
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    };
    FormattedText.prototype.render = function () {
        if (!this.props.text || this.props.text === '')
            return null;
        switch (this.props.format) {
            case "plain":
                return this.renderPlainText();
            case "xml":
                return this.renderXml();
            default:
                return this.renderMarkdown();
        }
    };
    FormattedText.prototype.renderPlainText = function () {
        var lines = this.props.text.replace('\r', '').split('\n');
        var elements = lines.map(function (line, i) { return React.createElement("span", {key: i}, 
            line, 
            React.createElement("br", null)); });
        return React.createElement("span", {className: "format-plain"}, elements);
    };
    FormattedText.prototype.renderXml = function () {
        // TODO: Implement Xml renderer
        //return <span className="format-xml"></span>;
        return this.renderMarkdown();
    };
    FormattedText.prototype.renderMarkdown = function () {
        var src = this.props.text || '';
        src = src.replace(/<br\s*\/?>/ig, '\r\n\r\n');
        var options = Object.assign({}, {
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            silent: false,
            smartypants: true
        }, this.props.markdownOptions);
        var renderer = options.renderer = new ReactRenderer(options, this.props.onImageLoad);
        var text = Marked(src, options);
        var elements = renderer.getElements(text);
        /*// debug
        const remaining = renderer.elements.filter(el => !!el);
        if (remaining.length) {
            console.warn(`There were ${remaining.length} unused markdown elements!`);
        }*/
        return React.createElement("span", {className: "format-markdown"}, elements);
    };
    return FormattedText;
}(React.Component));
exports.FormattedText = FormattedText;
var ReactRenderer = (function () {
    function ReactRenderer(options, onImageLoad) {
        this.options = options;
        this.onImageLoad = onImageLoad;
        this.key = 0;
        this.elements = [];
    }
    /**
     * We're being sneaky here. Marked is expecting us to render html to text and return that.
     * Instead, we're generating react elements and returning their array indices as strings,
     * which are concatenated by Marked into the final output. We return a stringified index that
     * is {{strongly delimited}}. We must do this because Marked can sometimes leak source text
     * into the stream, interspersed with our ids. This leaked text will be detected later and
     * turned into react elements.
     */
    ReactRenderer.prototype.addElement = function (element) {
        var elementId = this.elements.length;
        this.elements.push(element);
        return "{{" + elementId + "}}";
    };
    /**
     * getElements() reads indices from the input string and populates the return array with
     * corresponding react elements. Marked's lexer/parser/compiler may also leak source text
     * into input string. We detect instances of this and convert them to react elements on-the-fly.
     * Sample input text: "{{87}}{{88}}[{{89}}[{{90}}http://example.com/{{91}}"
     */
    ReactRenderer.prototype.getElements = function (text) {
        var _this = this;
        var elements = new Array();
        var re = /^{{\d+}}/g;
        while (true) {
            var len = text.length;
            // Consume elementIds until string end or a leak sequence is encountered
            text = text.replace(re, function (match) {
                var index = Number(match.match(/\d+/)[0]);
                elements.push(_this.elements[index]);
                _this.elements[index] = null;
                return '';
            });
            if (text.length == 0)
                break;
            // Consume leak sequences until string end or an id sequence is encountered
            var next = text.indexOf('{{');
            while (next > 0) {
                var subst = text.substr(0, next);
                subst = He.unescape(subst);
                elements.push(React.createElement("span", {key: this.key++}, subst));
                text = text.substr(next);
                next = text.indexOf('{{');
            }
            // Return remainder leak sequence
            if (len == text.length) {
                text = He.unescape(text);
                elements.push(React.createElement("span", {key: this.key++}, text));
                break;
            }
        }
        return elements.filter(function (el) { return !!el; });
    };
    /// MarkedRenderer overrides
    ReactRenderer.prototype.code = function (code, language) {
        return this.addElement(React.createElement("pre", {key: this.key++}, 
            React.createElement("code", null, He.unescape(code))
        ));
    };
    ReactRenderer.prototype.blockquote = function (quote) {
        return this.addElement(React.createElement("blockquote", {key: this.key++}, this.getElements(quote)));
    };
    ReactRenderer.prototype.html = function (html) {
        return this.addElement(React.createElement("span", {key: this.key++}, html));
    };
    ReactRenderer.prototype.heading = function (text, level, raw) {
        var HeadingTag = "h" + level;
        return this.addElement(React.createElement(HeadingTag, {key: this.key++}, this.getElements(text)));
    };
    ReactRenderer.prototype.hr = function () {
        return this.addElement(React.createElement("hr", {key: this.key++}));
    };
    ReactRenderer.prototype.list = function (body, ordered) {
        var ListTag = ordered ? "ol" : "ul";
        return this.addElement(React.createElement(ListTag, {key: this.key++}, this.getElements(body)));
    };
    ReactRenderer.prototype.listitem = function (text) {
        return this.addElement(React.createElement("li", {key: this.key++}, this.getElements(text)));
    };
    ReactRenderer.prototype.paragraph = function (text) {
        return this.addElement(React.createElement("p", {key: this.key++}, this.getElements(text)));
    };
    ReactRenderer.prototype.table = function (header, body) {
        return this.addElement(React.createElement("table", {key: this.key++}, 
            React.createElement("thead", null, this.getElements(header)), 
            React.createElement("tbody", null, this.getElements(body))));
    };
    ReactRenderer.prototype.tablerow = function (content) {
        return this.addElement(React.createElement("tr", {key: this.key++}, this.getElements(content)));
    };
    ReactRenderer.prototype.tablecell = function (content, flags) {
        var CellTag = flags.header ? "th" : "td";
        flags.align = flags.align || "initial";
        var inlineStyle = {
            textAlign: flags.align
        };
        return this.addElement(React.createElement(CellTag, {key: this.key++, style: inlineStyle}, this.getElements(content)));
    };
    ReactRenderer.prototype.strong = function (text) {
        return this.addElement(React.createElement("strong", {key: this.key++}, this.getElements(text)));
    };
    ReactRenderer.prototype.em = function (text) {
        return this.addElement(React.createElement("em", {key: this.key++}, this.getElements(text)));
    };
    ReactRenderer.prototype.codespan = function (code) {
        return this.addElement(React.createElement("code", {key: this.key++}, code));
    };
    ReactRenderer.prototype.br = function () {
        return this.addElement(React.createElement("br", {key: this.key++}));
    };
    ReactRenderer.prototype.del = function (text) {
        return this.addElement(React.createElement("del", {key: this.key++}, this.getElements(text)));
    };
    ReactRenderer.prototype.link = function (href, title, text) {
        if (this.options.sanitize) {
            try {
                var prot = decodeURIComponent(He.unescape(href)).toLowerCase();
                if (!(prot.startsWith('http://') || prot.startsWith('https://'))) {
                    return '';
                }
            }
            catch (e) {
                return '';
            }
        }
        return this.addElement(React.createElement("a", __assign({key: this.key++}, { href: href, title: title, target: '_blank' }), this.getElements(text)));
    };
    ReactRenderer.prototype.image = function (href, title, text) {
        var _this = this;
        if (this.options.sanitize) {
            try {
                var prot = decodeURIComponent(He.unescape(href)).toLowerCase();
                if (!(prot.startsWith('http://') || prot.startsWith('https://'))) {
                    return '';
                }
            }
            catch (e) {
                return '';
            }
        }
        return this.addElement(React.createElement("img", __assign({key: this.key++, onLoad: function () { return _this.onImageLoad(); }}, { src: href, title: title, alt: text })));
    };
    ReactRenderer.prototype.text = function (text) {
        return this.addElement(React.createElement("span", {key: this.key++}, He.unescape(text)));
    };
    return ReactRenderer;
}());
//# sourceMappingURL=FormattedText.js.map