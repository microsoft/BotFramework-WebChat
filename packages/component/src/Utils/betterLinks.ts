/* eslint-disable security/detect-object-injection */
import MarkdownIt from 'markdown-it';

function iterator(md, ruleName, tokenType, iterator) {
  function scan(state) {
    const { env = {} } = state;
    for (let blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
      if (state.tokens[blkIdx].type !== 'inline') {
        continue;
      }
      const inlineTokens = state.tokens[blkIdx].children;
      for (let i = inlineTokens.length - 1; i >= 0; i--) {
        if (inlineTokens[i].type !== tokenType) {
          continue;
        }
        iterator(inlineTokens, i, env);
      }
    }
  }
  md.core.ruler.push(ruleName, scan);
}

// Put a transparent pixel instead of the "open in new window" icon, so developers can easily modify the icon in CSS.
const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

type AttributeSetter = false | string | ((value?: string) => string);

export type LinkOptions = {
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

  /** Wraps the link with zero-width space. */
  wrapZeroWidthSpace?: boolean;
};

export type BetterLinkEnv = {
  decorateLink?: (href: string, textContent: string, linkOptions: LinkOptions) => LinkOptions | undefined;
  linkOptions?: LinkOptions;
};

// This is used for parsing Markdown for external links.
const internalMarkdownIt = new MarkdownIt();

const ZERO_WIDTH_SPACE_TOKEN = {
  content: '\u200b',
  type: 'text'
};

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

const betterLinks = (markdown: typeof MarkdownIt): typeof MarkdownIt =>
  markdown.use(iterator, 'url_new_win', 'link_open', (tokens, index, env) => {
    const { decorateLink, linkOptions }: BetterLinkEnv = env;

    const indexOfLinkCloseToken = tokens.indexOf(tokens.slice(index + 1).find(({ type }) => type === 'link_close'));
    // eslint-disable-next-line no-magic-numbers
    const updatedTokens = tokens.splice(index, ~indexOfLinkCloseToken ? indexOfLinkCloseToken - index + 1 : 2);

    try {
      const [linkOpenToken] = updatedTokens;
      const linkCloseToken = updatedTokens[updatedTokens.length - 1];

      const [, href] = linkOpenToken.attrs.find(([name]) => name === 'href');
      const nodesInLink = updatedTokens.slice(1, updatedTokens.length - 1);

      const textContent = nodesInLink
        .filter(({ type }) => type === 'text')
        .map(({ content }) => content)
        .join(' ');

      const decoration = decorateLink?.(href, textContent, linkOptions);

      if (!decoration) {
        return;
      }

      const { ariaLabel, asButton, className, iconAlt, iconClassName, rel, target, title, wrapZeroWidthSpace } =
        decoration;

      setTokenAttribute(linkOpenToken.attrs, 'aria-label', ariaLabel);
      setTokenAttribute(linkOpenToken.attrs, 'class', className);
      setTokenAttribute(linkOpenToken.attrs, 'title', title);

      if (iconClassName) {
        const iconTokens = internalMarkdownIt.parseInline(`![](${TRANSPARENT_GIF})`)[0].children;

        setTokenAttribute(iconTokens[0].attrs, 'class', iconClassName);
        setTokenAttribute(iconTokens[0].attrs, 'title', iconAlt);

        // Add an icon before </a>.
        // eslint-disable-next-line no-magic-numbers
        updatedTokens.splice(-1, 0, ...iconTokens);
      }

      if (asButton) {
        setTokenAttribute(linkOpenToken.attrs, 'href', false);

        linkOpenToken.tag = 'button';

        setTokenAttribute(linkOpenToken.attrs, 'type', 'button');
        setTokenAttribute(linkOpenToken.attrs, 'value', href);

        linkCloseToken.tag = 'button';
      } else {
        setTokenAttribute(linkOpenToken.attrs, 'rel', rel);
        setTokenAttribute(linkOpenToken.attrs, 'target', target);
      }

      if (wrapZeroWidthSpace) {
        updatedTokens.splice(0, 0, ZERO_WIDTH_SPACE_TOKEN);
        updatedTokens.splice(Infinity, 0, ZERO_WIDTH_SPACE_TOKEN);
      }
    } finally {
      tokens.splice(index, 0, ...updatedTokens);
    }
  });

export default betterLinks;
