const languageClassPrefix = 'language-';

export default function codeBlockDocumentMod<T extends Document | DocumentFragment>(
  documentFragment: T,
  codeBlockTagName: string
): T {
  for (const preElement of [...documentFragment.querySelectorAll('pre:has(code:only-child)')]) {
    const [codeElement] = preElement.children;

    const language = [...codeElement.classList.values()]
      .find(cls => cls.startsWith(languageClassPrefix))
      ?.substring(languageClassPrefix.length);

    const codeBlockRoot = document.createElement(codeBlockTagName);

    language && codeBlockRoot.setAttribute('language', language);

    codeBlockRoot.append(codeElement);

    preElement.replaceWith(codeBlockRoot);
  }

  return documentFragment;
}
