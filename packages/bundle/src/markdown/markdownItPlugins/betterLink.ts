import iterator from 'markdown-it-for-inline';
import MarkdownIt from 'markdown-it';

// Put a transparent pixel instead of the "open in new window" icon, so developers can easily modify the icon in CSS.
const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

type Decoration = {
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
    const token = tokens[+index];

    const [, href] = token.attrs.find(([name]) => name === 'href');

    const decoration = decorate(href);

    if (decoration) {
      const { externalLinkAlt, iconClassName, linkClassName, rel, target } = decoration;

      linkClassName && token.attrSet('class', linkClassName);
      rel && token.attrSet('rel', rel);
      target && token.attrSet('target', target);
      externalLinkAlt && token.attrSet('title', externalLinkAlt);

      if (iconClassName) {
        const iconTokens = internalMarkdownIt.parseInline(`![${externalLinkAlt || ''}](${TRANSPARENT_GIF})`)[0]
          .children;

        iconTokens[0].attrJoin('class', iconClassName);

        // Add an icon before </a>.
        const indexOfLinkCloseToken = tokens.indexOf(tokens.slice(index + 1).find(({ type }) => type === 'link_close'));

        ~indexOfLinkCloseToken && tokens.splice(indexOfLinkCloseToken, 0, ...iconTokens);
      }
    }
  });

export default betterLink;
