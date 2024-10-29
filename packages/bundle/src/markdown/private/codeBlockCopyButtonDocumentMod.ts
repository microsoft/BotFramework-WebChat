export default function codeBlockCopyButtonDocumentMod<T extends Document | DocumentFragment>(
  documentFragment: T,
  {
    codeBlockCopyButtonAltCopied,
    codeBlockCopyButtonAltCopy,
    codeBlockCopyButtonClassName,
    codeBlockCopyButtonTagName
  }: Readonly<{
    codeBlockCopyButtonAltCopied: string;
    codeBlockCopyButtonAltCopy: string;
    codeBlockCopyButtonClassName: string;
    codeBlockCopyButtonTagName: string;
  }>
): T {
  for (const preElement of [...documentFragment.querySelectorAll('pre')]) {
    const codeBlockCopyButtonElement = documentFragment.ownerDocument.createElement(codeBlockCopyButtonTagName);

    codeBlockCopyButtonElement.className = codeBlockCopyButtonClassName;
    codeBlockCopyButtonElement.dataset.altCopied = codeBlockCopyButtonAltCopied;
    codeBlockCopyButtonElement.dataset.altCopy = codeBlockCopyButtonAltCopy;
    codeBlockCopyButtonElement.dataset.value = preElement.textContent;

    preElement.classList.add('webchat__render-markdown__code-block');
    preElement.prepend(codeBlockCopyButtonElement);
  }

  return documentFragment;
}
