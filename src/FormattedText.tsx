import * as Marked from 'marked';
import * as React from 'react';
import * as He from 'he';


export interface IFormattedTextProps {
    text?: string,
    format?: string,
    markdownOptions?: MarkedOptions
}

export class FormattedText extends React.Component<IFormattedTextProps, {}> {

    constructor(props: IFormattedTextProps) {
        super(props);
    }

    shouldComponentUpdate(nextProps: IFormattedTextProps): boolean {
        // I don't love this, but it is fast and it works.
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    }

    render() {
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
    }

    private renderPlainText() {
        const lines = this.props.text.replace('\r', '').split('\n');
        const elements = lines.map((line, i) => <span key={i}>{line}<br /></span>);
        return <span className="format-plain">{elements}</span>;
    }

    private renderXml() {
        // TODO: Implement Xml renderer
        //return <span className="format-xml"></span>;
        return this.renderMarkdown();
    }

    private renderMarkdown() {
        let src = this.props.text || '';
        src = src.replace(/<br\s*\/?>/ig, '\r\n\r\n');
        const options: MarkedOptions = Object.assign({}, {
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            silent: false,
            smartypants: true
        } as MarkedOptions, this.props.markdownOptions);
        const renderer = options.renderer = new ReactRenderer(options);
        const text = Marked(src, options);
        const elements = renderer.getElements(text);
        /*// debug
        const remaining = renderer.elements.filter(el => !!el);
        if (remaining.length) {
            console.warn(`There were ${remaining.length} unused markdown elements!`);
        }*/
        return <span className="format-markdown">{elements}</span>;
    }
}


class ReactRenderer implements MarkedRenderer {

    key: number = 0;
    elements: React.ReactElement<any>[] = [];

    constructor(private options) {
    }

    /**
     * We're being sneaky here. Marked is expecting us to render html to text and return that.
     * Instead, we're generating react elements and returning their array indices as strings,
     * which are concatenated by Marked into the final output. We return a stringified index that
     * is {{strongly delimited}}. We must do this because Marked can sometimes leak source text
     * into the stream, interspersed with our ids. This leaked text will be detected later and
     * turned into react elements.
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
                elements.push(<span key={this.key++}>{subst}</span>);
                text = text.substr(next);
                next = text.indexOf('{{');
            }
            // Return remainder leak sequence
            if (len == text.length) {
                text = He.unescape(text);
                elements.push(<span key={this.key++}>{text}</span>);
                break;
            }
        }
        return elements.filter(el => !!el);
    }

    /// MarkedRenderer overrides

    code(code: string, language: string): string {
        return this.addElement(<pre key={this.key++}><code>{He.unescape(code)}</code></pre>);
    }

    blockquote(quote: string): string {
        return this.addElement(<blockquote key={this.key++}>{this.getElements(quote)}</blockquote>);
    }

    html(html: string): string {
        return this.addElement(<span key={this.key++}>{html}</span>);
    }

    heading(text: string, level: number, raw: string): string {
        const HeadingTag = `h${level}`;
        return this.addElement(<HeadingTag key={this.key++}>{this.getElements(text)}</HeadingTag>);
    }

    hr(): string {
        return this.addElement(<hr key={this.key++} />)
    }

    list(body: string, ordered: boolean): string {
        const ListTag = ordered ? "ol" : "ul";
        return this.addElement(<ListTag key={this.key++}>{this.getElements(body)}</ListTag>);
    }

    listitem(text: string): string {
        return this.addElement(<li key={this.key++}>{this.getElements(text)}</li>);
    }

    paragraph(text: string): string {
        return this.addElement(<p key={this.key++}>{this.getElements(text)}</p>);
    }

    table(header: string, body: string): string {
        return this.addElement(
            <table key={this.key++}>
                <thead>
                    {this.getElements(header)}
                </thead>
                <tbody>
                    {this.getElements(body)}
                </tbody>
            </table>);
    }

    tablerow(content: string): string {
        return this.addElement(<tr key={this.key++}>{this.getElements(content)}</tr>);
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
        return this.addElement(<CellTag key={this.key++} style={inlineStyle}>{this.getElements(content)}</CellTag>);
    }

    strong(text: string): string {
        return this.addElement(<strong key={this.key++}>{this.getElements(text)}</strong>);
    }

    em(text: string): string {
        return this.addElement(<em key={this.key++}>{this.getElements(text)}</em>);
    }

    codespan(code: string): string {
        return this.addElement(<code key={this.key++}>{code}</code>);
    }

    br(): string {
        return this.addElement(<br key={this.key++} />);
    }

    del(text: string): string {
        return this.addElement(<del key={this.key++}>{this.getElements(text)}</del>);
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
        return this.addElement(<a key={this.key++} {...{ href: href, title: title }}>{this.getElements(text)}</a>);
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
        return this.addElement(<img key={this.key++} {...{ src: href, title: title, alt: text }} />);
    }

    text(text: string): string {
        return this.addElement(<span key={this.key++}>{He.unescape(text)}</span>);
    }
}
