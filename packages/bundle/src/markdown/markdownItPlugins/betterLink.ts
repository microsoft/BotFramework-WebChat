import iterator from 'markdown-it-for-inline';
import MarkdownIt from 'markdown-it';

// Put a transparent pixel instead of the "open in new window" icon, so developers can easily modify the icon in CSS.
const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

type Decoration = {
  asButton?: boolean;
  externalLinkAlt?: string;
  iconClassName?: string;
  linkClassName?: string;
  rel?: string;
  target?: string;
};

// This is used for parsing Markdown for external links.
const internalMarkdownIt = new MarkdownIt();

const betterLink = (
  markdown: typeof MarkdownIt,
  decorate: (href: string) => Decoration | undefined
): typeof MarkdownIt =>
  markdown.use(iterator, 'url_new_win', 'link_open', (tokens, index) => {
    const indexOfLinkCloseToken = tokens.indexOf(tokens.slice(index + 1).find(({ type }) => type === 'link_close'));
    const token = tokens[+index];

    const [, href] = token.attrs.find(([name]) => name === 'href');
    // const nodesInLink = tokens.slice(index + 1, indexOfLinkCloseToken);

    // const textNode = nodesInLink.find(({ type }) => type === 'text');

    const decoration = decorate(href);

    if (decoration) {
      const { asButton, externalLinkAlt, iconClassName, linkClassName, rel, target } = decoration;

      linkClassName && token.attrSet('class', linkClassName);
      externalLinkAlt && token.attrSet('title', externalLinkAlt);

      if (iconClassName) {
        const iconTokens = internalMarkdownIt.parseInline(`![${externalLinkAlt || ''}](${TRANSPARENT_GIF})`)[0]
          .children;

        iconTokens[0].attrJoin('class', iconClassName);

        // Add an icon before </a>.
        ~indexOfLinkCloseToken && tokens.splice(indexOfLinkCloseToken, 0, ...iconTokens);
      }

      if (asButton) {
        token.tag = 'button';

        token.attrs = token.attrs.filter(({ type }) => type !== 'href');

        token.attrSet('type', 'button');
        token.attrSet('value', href);

        if (~indexOfLinkCloseToken) {
          tokens[+indexOfLinkCloseToken].tag = 'button';
        }
      } else {
        rel && token.attrSet('rel', rel);
        target && token.attrSet('target', target);
      }
    }
  });

export default betterLink;
