import { StyleOptions } from 'botframework-webchat-api';
import { HighlightCodeFn, parseDocumentFragmentFromString } from 'botframework-webchat-component/internal';

export default function highlightCodeDocumentMod<T extends Document | DocumentFragment>(
  documentFragment: T,
  highlightCode: HighlightCodeFn,
  theme: StyleOptions['codeBlockTheme']
): T {
  for (const preElement of [...documentFragment.querySelectorAll('pre')]) {
    if (preElement.children.length === 1) {
      const [firstChild] = preElement.children;

      if (firstChild.matches('code')) {
        const language = firstChild.classList
          .values()
          .find(cls => cls.startsWith('language-'))
          ?.replace('language-', '');

        const content = highlightCode(firstChild.textContent, language, { theme });

        const newPreElement = (
          content instanceof DocumentFragment ? content : parseDocumentFragmentFromString(content)
        ).querySelector('pre');
        newPreElement.classList.add('webchat__code-block');
        newPreElement.dataset.theme = theme;
        newPreElement.dataset.language = language;

        preElement.replaceWith(newPreElement);
      }
    }
  }

  return documentFragment;
}
