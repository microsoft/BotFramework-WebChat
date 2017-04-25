import * as MarkdownIt from 'markdown-it';
import * as React from 'react';

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