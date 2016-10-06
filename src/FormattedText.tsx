import * as React from 'react';
import * as Marked from 'marked';
import * as He from 'he';


interface Props {
    text: string,
    format: string
}

interface State {
}

export class FormattedText extends React.Component<Props, State> {

    shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any): boolean {
        return this.props.text !== nextProps.text || this.props.format !== nextProps.format;
    }

    render() {
        switch (this.props.format) {
            case "plain":
                return this.renderPlainText();
            case "xml":
                return this.renderXml();
            default:
                return this.renderMarkdown();
        }
    }

    renderPlainText() {
        // TODO @eanders-MS: This is placeholder until updated to DirectLine 3.0
        const src = this.props.text || '';
        const lines = src.replace('\r', '').split('\n');
        const elements = lines.map(line => <span>{line}<br /></span>);
        return <span className="format-plain">{ elements }</span>;
    }

    renderXml() {
        // TODO @eanders-MS: Implement once updated to DirectLine 3.0
        return <span className="format-xml"></span>;
    }

    renderMarkdown() {
        let src = this.props.text || '';
        src = src.replace(/<br\s*\/?>/ig, '\r\n\r\n');
        const options: MarkedOptions = {
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            silent: false,
            smartypants: true
        }
        const renderer = options.renderer = new ReactRenderer(options);
        const text = Marked(src, options);
        const elements = renderer.getElements(text);
        /*// debug
        const remaining = renderer.elements.filter(el => !!el);
        if (remaining.length) {
            console.warn(`There were ${remaining.length} unused markdown elements!`);
        }*/
        return <span className="format-markdown">{ elements }</span>;
    }
}


class ReactRenderer implements MarkedRenderer {

    elements: React.ReactElement<any>[] = [];

    constructor(private options) {
    }

    /**
     * We're being sneaky here. Marked is expecting us to render html to text and return that.
     * Instead, we're generating react elements and returning their array indices as strings,
     * which are concatenated by Marked into the final output. We return astringified index that
     * is {{strongly delimited}}. This is because Marked can sometimes leak source text into the
     * stream, interspersed with our ids. This leaked text will be detected later and turned
     * into react elements.
     */
    addElement(element: React.ReactElement<any>) {
        const elementId = this.elements.length;
        this.elements.push(element);
        return `{{${elementId}}}`;
    }

    /**
     * getElements() reads indices from the input string and populates the return array with
     * corresponding react elements. Marked's lexer/parser/compiler may also leak source text
     * into input string. We detect instances of this and convert them to react elements on-the-fly.
     * Sample input text: "{{87}}{{88}}[{{89}}[{{90}}http://example.com/{{91}}"
     */
    getElements(text: string): React.ReactElement<any>[] {
        const elements = new Array<React.ReactElement<any>>();
        const re = /^{{\d+}}/g;
        while (true) {
            const len = text.length;
            // Consume elementIds until string end or a leak sequence is encountered
            text = text.replace(re, (match) => {
                const index = Number(match.match(/\d+/)[0]);
                elements.push(this.elements[index]);
                this.elements[index] = null;
                return '';
            })
            if (text.length == 0)
                break;
            // Consume leak sequences until string end or an id sequence is encountered
            let next = text.indexOf('{{');
            while (next > 0) {
                let subst = text.substr(0, next);
                subst = He.unescape(subst);
                elements.push(<span>{subst}</span>);
                text = text.substr(next);
                next = text.indexOf('{{');
            }
            // Return remainder leak sequence
            if (len == text.length) {
                text = He.unescape(text);
                elements.push(<span>{ text }</span>);
                break;
            }
        }
        return elements.filter(el => !!el);
    }

    /// MarkedRenderer overrides

    code(code: string, language: string): string {
        return this.addElement(<pre><code>{ He.unescape(code) }</code></pre>);
    }

    blockquote(quote: string): string {
        return this.addElement(<blockquote>{ this.getElements(quote) }</blockquote>);
    }

    html(html: string): string {
        return this.addElement(<span>{ html }</span>);
    }

    heading(text: string, level: number, raw: string): string {
        const HeadingTag = `h${level}`;
        return this.addElement(<HeadingTag>{ this.getElements(text) }</HeadingTag>);
    }

    hr(): string {
        return this.addElement(<hr />)
    }

    list(body: string, ordered: boolean): string {
        const ListTag = ordered ? "ol" : "ul";
        return this.addElement(<ListTag>{ this.getElements(body )}</ListTag>);
    }

    listitem(text: string): string {
        return this.addElement(<li>{ this.getElements(text) }</li>);
    }

    paragraph(text: string): string {
        return this.addElement(<p>{ this.getElements(text) }</p>);
    }

    table(header: string, body: string): string {
        return this.addElement(
            <table>
                <thead>
                    { this.getElements(header) }
                </thead>
                <tbody>
                    { this.getElements(body) }
                </tbody>
            </table>);
    }

    tablerow(content: string): string {
        return this.addElement(<tr>{ this.getElements(content) }</tr>);
    }

    tablecell(content: string, flags: {
        header: boolean,
        align: string
    }): string {
        const CellTag = flags.header ? "th" : "td";
        flags.align = flags.align || "initial";
        var inlineStyle = {
            textAlign: flags.align
        }
        return this.addElement(<CellTag style={ inlineStyle }>{this.getElements(content)}</CellTag>);
    }

    strong(text: string): string {
        return this.addElement(<strong>{ this.getElements(text) }</strong>);
    }

    em(text: string): string {
        return this.addElement(<em>{ this.getElements(text) }</em>);
    }

    codespan(code: string): string {
        return this.addElement(<code>{ code }</code>);
    }

    br(): string {
        return this.addElement(<br />);
    }

    del(text: string): string {
        return this.addElement(<del>{ this.getElements(text) }</del>);
    }

    link(href: string, title: string, text: string): string {
        if (this.options.sanitize) {
            try {
                var prot = decodeURIComponent(He.unescape(href)).toLowerCase();
                if (!(prot.startsWith('http://') || prot.startsWith('https://'))) {
                    return '';
                }
            } catch (e) {
                return '';
            }
        }
        return this.addElement(<a {...{ href: href, title: title }}>{this.getElements(text)}</a>);
    }

    image(href: string, title: string, text: string): string {
        if (this.options.sanitize) {
            try {
                var prot = decodeURIComponent(He.unescape(href)).toLowerCase();
                if (!(prot.startsWith('http://') || prot.startsWith('https://'))) {
                    return '';
                }
            } catch (e) {
                return '';
            }
        }
        return this.addElement(<img {...{ src: href, title: title, alt: text }} />);
    }

    text(text: string): string {
        return this.addElement(<span>{ He.unescape(text) }</span>);
    }
}
