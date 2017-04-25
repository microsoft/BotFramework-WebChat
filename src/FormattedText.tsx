import * as MarkdownIt from 'markdown-it';
import * as React from 'react';

export interface MarkdownItOptions{
  html?:         boolean,       // Enable HTML tags in source
  xhtmlOut?:     boolean,       // Use '/' to close single tags (<br />).
                                // This is only for full CommonMark compatibility.
  breaks?:       boolean,       // Convert '\n' in paragraphs into <br>
  langPrefix?:   string,        // CSS language prefix for fenced blocks. Can be
                                // useful for external highlighters.
  linkify?:      boolean,       // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  typographer?:  boolean,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Could be either a String or an Array.
  //
  // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
  // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
  quotes?: Object,

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed and should be escaped externaly.
  // If result starts with <pre... internal wrapper is skipped.
  highlight?: Object    
}

export interface IFormattedTextProps {
    text: string,
    format: string,
    onImageLoad: () => void,
    markdownOptions?: MarkdownItOptions
}

export const FormattedText = (props: IFormattedTextProps) => {
    if (!props.text || props.text === '')
        return null;

    switch (props.format) {
        case "plain":
            return renderPlainText(props.text);
        default:
            return renderMarkdown(props.text, props.onImageLoad);
    }
}

const renderPlainText = (text: string) => {
    const lines = text.replace('\r', '').split('\n');
    const elements = lines.map((line, i) => <span key={i}>{line}<br /></span>);
    return <span className="format-plain">{elements}</span>;
}

const markdownIt = new MarkdownIt({ html: true, linkify: true, typographer: true });

const renderMarkdown = (
    text: string,
    onImageLoad: () => void
) => {
    const src = text.replace(/<br\s*\/?>/ig, '\r\n\r\n');
    const __html = markdownIt.render(src);
    return <div className="format-markdown" dangerouslySetInnerHTML={{ __html }} />;
}