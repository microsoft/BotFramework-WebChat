import updateMarkdownAttrs from './updateMarkdownAttrs';
import walkMarkdownTokens from './walkMarkdownTokens';

export default function addTargetBlankToHyperlinksMarkdown(tokens) {
  return walkMarkdownTokens(tokens, token => {
    switch (token.type) {
      case 'link_open':
        token = updateMarkdownAttrs(token, attrs =>
          // Adds only for external links, e.g. https://, data:
          // Don't add for internal links, e.g. #ref-1, ?q=doc
          /^\w/u.test(attrs.href)
            ? {
                ...attrs,
                rel: 'noopener noreferrer',
                target: '_blank'
              }
            : attrs
        );

        break;

      default:
        break;
    }

    return token;
  });
}
