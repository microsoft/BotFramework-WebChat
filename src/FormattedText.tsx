import * as MarkdownIt from 'markdown-it';
import * as React from 'react';
import { twemoji } from './lib.js'

export interface IFormattedTextProps {
    text: string,
    format: string,
    onImageLoad: () => void
}

export const FormattedText = (props: IFormattedTextProps) => {
    if (!props.text || props.text === '')
        return null;

    switch (props.format) {
        case "plain":
            return renderPlainText(props.text);
        case "xml":
        default:
            return renderMarkdown(props.text, props.onImageLoad);
    }
}

const renderPlainText = (text: string) => {
    const lines = text.replace('\r', '').split('\n');
    const elements = lines.map((line, i) => <span key={i} dangerouslySetInnerHTML={{ __html: twemoji.parse(escapeHtml(line))+'<br />' }} />);
    return <span className="format-plain">{elements}</span>;
}

const markdownIt = new MarkdownIt({ html: false, xhtmlOut: true, breaks: true, linkify: true, typographer: true });

//configure MarkdownIt to open links in new tab
//from https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer

// Remember old renderer, if overriden, or proxy to default renderer
const defaultRender = markdownIt.renderer.rules.link_open || ((tokens, idx, options, env, self) => {
    return self.renderToken(tokens, idx, options);
});

markdownIt.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    // If you are sure other plugins can't add `target` - drop check below
    const targetIndex = tokens[idx].attrIndex('target');

    if (targetIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']); // add new attribute
    } else {
        tokens[idx].attrs[targetIndex][1] = '_blank';    // replace value of existing attr
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
};

const renderMarkdown = (
    text: string,
    onImageLoad: () => void
) => {
    let __html;

    if (text.trim()) {
        const src = text
          // convert <br> tags to blank lines for markdown
          .replace(/<br\s*\/?>/ig, '\n')
          // URL encode all links
          .replace(/\[(.*?)\]\((.*?)( +".*?"){0,1}\)/ig, (match, text, url, title) => `[${text}](${markdownIt.normalizeLink(url)}${title === undefined ? '' : title})`);

        const arr = src.split(/\n *\n|\r\n *\r\n|\r *\r/);
        const ma = arr.map(a => markdownIt.render(a));

        __html = ma.join('<br/>');
    } else {
        // Replace spaces with non-breaking space Unicode characters
        __html = text.replace(/ */, '\u00A0');
    }

    // FEEDYOU use twemoji to make emoji compatible
    __html = twemoji.parse(__html)

    return <div className="format-markdown" dangerouslySetInnerHTML={{ __html }} />;
}

function escapeHtml(unsafe: string) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }