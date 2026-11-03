import {
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString,
  stripParagraphContainer
} from '@msinternal/botframework-webchat-component-better-link';
import { micromark } from 'micromark';
import addTargetBlankToHyperlinks from '../Utils/addTargetBlankToHyperlinks';

function renderMarkdownInline(markdown: string): string {
  const documentFragment = parseDocumentFragmentFromString(micromark(markdown));

  addTargetBlankToHyperlinks(documentFragment);

  const html = serializeDocumentFragmentIntoString(documentFragment);

  return stripParagraphContainer(html);
}

export default renderMarkdownInline;
