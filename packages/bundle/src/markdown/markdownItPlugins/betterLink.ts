import iterator from 'markdown-it-for-inline';
import MarkdownIt from 'markdown-it';

// Put a transparent pixel instead of the "open in new window" icon, so developers can easily modify the icon in CSS.
const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

type Decoration = {
  asButton?: boolean;
  iconAlt?: string;
  iconClassName?: string;
  linkAriaLabel?: string;
  linkClassName?: string;
  rel?: string;
  target?: string;
};

// This is used for parsing Markdown for external links.
const internalMarkdownIt = new MarkdownIt();

function attrDelete(attrs: Array<[string, string]>, name: string) {
  const index = attrs.findIndex(token => token[0] === name);

  if (~index) {
    attrs.splice(index, 1);
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

    if (decoration) {
      const { asButton, iconAlt, iconClassName, linkAriaLabel, linkClassName, rel, target } = decoration;

      linkAriaLabel && token.attrSet('aria-label', linkAriaLabel);
      linkClassName && token.attrSet('class', linkClassName);

      // By default, Markdown-It will set "title" to the link title in link definition.

      // However, "title" may be narrated by screen reader:
      // - Edge
      //   - <a> will narrate "aria-label" but not "title"
      //   - <button> will narrate both "aria-label" and "title"
      // - NVDA
      //   - <a> will narrate both "aria-label" and "title"
      //   - <button> will narrate both "aria-label" and "title"

      // Title makes it very difficult to control narrations by the screen reader. Thus, we are disabling it in favor of "aria-label".

      attrDelete(token.attrs, 'title');

      if (iconClassName) {
        // const iconTokens = internalMarkdownIt.parseInline(`![${iconAlt || ''}](${TRANSPARENT_GIF})`)[0].children;
        const iconTokens = internalMarkdownIt.parseInline(`![](${TRANSPARENT_GIF})`)[0].children;

        iconTokens[0].attrJoin('class', iconClassName);
        iconAlt && iconTokens[0].attrSet('title', iconAlt);

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
