import iterator from 'markdown-it-for-inline';
import MarkdownIt from 'markdown-it';

// Put a transparent pixel instead of the "open in new window" icon, so developers can easily modify the icon in CSS.
const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

type AttributeSetter = false | string | ((value?: string) => string);

type Decoration = {
  /** Value of "aria-label" attribute of the link. If set to `false`, remove existing attribute. */
  ariaLabel?: AttributeSetter;

  /** Turns this link into a <button> with "value" attribute instead of "href". */
  asButton?: boolean;

  /** Value of "class" attribute of the link. If set to `false`, remove existing attribute. */
  className?: AttributeSetter;

  /** Alternate text of the image icon appended to the link. */
  iconAlt?: string;

  /** Class name of the image icon appended to the link. */
  iconClassName?: string;

  /** Value of "rel" attribute of the link. If set to `false`, remove existing attribute. */
  rel?: AttributeSetter;

  /** Value of "target" attribute of the link. If set to `false`, remove existing attribute. */
  target?: AttributeSetter;

  /** Value of "title" attribute of the link. If set to `false`, remove existing attribute. */
  title?: AttributeSetter;
};

// This is used for parsing Markdown for external links.
const internalMarkdownIt = new MarkdownIt();

function setTokenAttribute(attrs: Array<[string, string]>, name: string, value?: AttributeSetter) {
  const index = attrs.findIndex(entry => entry[0] === name);

  if (value === false) {
    ~index && attrs.splice(index, 1);
  } else if (typeof value === 'string') {
    if (~index) {
      attrs[+index][1] = value;
    } else {
      attrs.push([name, value]);
    }
  } else if (typeof value === 'function') {
    if (~index) {
      attrs[+index][1] = value(attrs[+index][1]);
    } else {
      attrs.push([name, value()]);
    }
  }
}

const betterLink = (
  markdown: typeof MarkdownIt,
  decorate: (href: string, textContent: string) => Decoration | undefined
): typeof MarkdownIt =>
  markdown.use(iterator, 'url_new_win', 'link_open', (tokens, index) => {
    const indexOfLinkCloseToken = tokens.indexOf(tokens.slice(index + 1).find(({ type }) => type === 'link_close'));
    const token = tokens[+index];

    const [, href] = token.attrs.find(([name]) => name === 'href');
    const nodesInLink = tokens.slice(index + 1, indexOfLinkCloseToken);

    const textContent = nodesInLink
      .filter(({ type }) => type === 'text')
      .map(({ content }) => content)
      .join(' ');

    const decoration = decorate(href, textContent);

    if (!decoration) {
      return;
    }

    const { ariaLabel, asButton, className, iconAlt, iconClassName, rel, target, title } = decoration;

    setTokenAttribute(token.attrs, 'aria-label', ariaLabel);
    setTokenAttribute(token.attrs, 'class', className);
    setTokenAttribute(token.attrs, 'title', title);

    if (iconClassName) {
      const iconTokens = internalMarkdownIt.parseInline(`![](${TRANSPARENT_GIF})`)[0].children;

      setTokenAttribute(iconTokens[0].attrs, 'class', iconClassName);
      setTokenAttribute(iconTokens[0].attrs, 'title', iconAlt);

      // Add an icon before </a>.
      ~indexOfLinkCloseToken && tokens.splice(indexOfLinkCloseToken, 0, ...iconTokens);
    }

    if (asButton) {
      setTokenAttribute(token.attrs, 'href', false);

      token.tag = 'button';

      setTokenAttribute(token.attrs, 'type', 'button');
      setTokenAttribute(token.attrs, 'value', href);

      if (~indexOfLinkCloseToken) {
        tokens[+indexOfLinkCloseToken].tag = 'button';
      }
    } else {
      setTokenAttribute(token.attrs, 'rel', rel);
      setTokenAttribute(token.attrs, 'target', target);
    }
  });

export default betterLink;
