import * as MarkdownIt from 'markdown-it';
import * as React from 'react';

export interface IFormattedTextProps {
    text: string,
    format: string,
    onImageLoad: () => void,
    markdownOptions?: MarkdownIt.Options
}

export const FormattedText = (props: IFormattedTextProps) => {
    if (!props.text || props.text === '')
        return null;

    switch (props.format) {
        case "plain":
            return renderPlainText(props.text);
        default:
            return renderMarkdown(props.text, props.markdownOptions, props.onImageLoad);
    }
}

const renderPlainText = (text: string) => {
    const lines = text.replace('\r', '').split('\n');
    const elements = lines.map((line, i) => <span key={i}>{line}<br /></span>);
    return <span className="format-plain">{elements}</span>;
}

const renderMarkdown = (
    text: string,
    markdownOptions: MarkdownIt.Options,
    onImageLoad: () => void
) => {
    const src = text.replace(/<br\s*\/?>/ig, '\r\n\r\n');
    markdownOptions = markdownOptions == null ? { html: true, linkify: true, typographer: true } : markdownOptions;
    return MarkdownItSing.render(markdownOptions, src);
}

namespace MarkdownItSing{
    export function render(markdownOptions, src){
        const md = new MarkdownIt(markdownOptions);
        const elements = md.render(src);
        return <div className="format-markdown" dangerouslySetInnerHTML={{ __html: elements }} />;
    }
}