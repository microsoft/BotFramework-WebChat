import classNames from 'classnames';
import iterator from 'markdown-it-for-inline';
import MarkdownIt from 'markdown-it';

const linkAsButton = (
  markdown: typeof MarkdownIt,
  buttonClassName: string,
  predicate: (href: string) => boolean
): typeof MarkdownIt =>
  markdown.use(iterator, 'link_as_button', 'link_open', (tokens, index) => {
    const token = tokens[+index];

    const [, href] = token.attrs.find(([name]) => name === 'href');

    if (!predicate(href)) {
      return;
    }

    token.tag = 'button';

    token.attrSet('class', classNames(token.attrGet('class'), buttonClassName));
    token.attrSet('type', 'button');
    token.attrSet('value', href);

    const linkCloseToken = tokens.slice(index + 1).find(({ type }: { type: string }) => type === 'link_close');

    if (linkCloseToken) {
      linkCloseToken.tag = 'button';
    }
  });

export default linkAsButton;
