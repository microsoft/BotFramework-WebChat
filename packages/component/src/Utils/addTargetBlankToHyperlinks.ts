import { betterLinkDocumentMod } from '@msinternal/botframework-webchat-component-better-link';

function addTargetBlankToHyperlinks(documentFragment: DocumentFragment) {
  betterLinkDocumentMod(documentFragment, href => {
    if (/^\w/u.test(href)) {
      return {
        rel: 'noopener noreferrer',
        target: '_blank'
      };
    }
  });
}

export default addTargetBlankToHyperlinks;
