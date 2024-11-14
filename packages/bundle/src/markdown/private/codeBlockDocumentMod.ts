export default function codeBlockDocumentMod<T extends Document | DocumentFragment>(
  documentFragment: T,
  codeBlockTagName: string,
  codeBlockTheme: string
): T {
  for (const preElement of [...documentFragment.querySelectorAll('pre:has(code:only-child)')]) {
    const [codeElement] = preElement.children;

    const language = codeElement.classList
      .values()
      .find(cls => cls.startsWith('language-'))
      ?.replace('language-', '');

    const codeBlockRoot = document.createElement(codeBlockTagName);

    codeBlockRoot.classList.add('webchat__code-block');
    codeBlockRoot.classList.add('webchat__render-markdown__code-block');

    codeBlockRoot.setAttribute('theme', codeBlockTheme);
    codeBlockRoot.setAttribute('language', language);

    codeBlockRoot.append(codeElement);

    preElement.replaceWith(codeBlockRoot);
  }

  return documentFragment;
}
