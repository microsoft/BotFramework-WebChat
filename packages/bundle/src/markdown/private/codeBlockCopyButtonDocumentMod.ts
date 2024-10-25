export default function codeBlockCopyButtonDocumentMod<T extends Document | DocumentFragment>(
  documentFragment: T,
  { codeBlockCopyButtonTagName }: { codeBlockCopyButtonTagName: string }
): T {
  for (const preElement of [...documentFragment.querySelectorAll('pre')]) {
    const codeBlockCopyButtonElement = documentFragment.ownerDocument.createElement(codeBlockCopyButtonTagName);

    codeBlockCopyButtonElement.dataset.value = preElement.textContent;

    preElement.classList.add('webchat__render-markdown__code-block');
    preElement.prepend(codeBlockCopyButtonElement);
  }

  return documentFragment;
}
