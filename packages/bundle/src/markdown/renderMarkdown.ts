import {
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString
} from 'botframework-webchat-component/internal';
import { onErrorResumeNext } from 'botframework-webchat-core';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { math, mathHtml } from 'micromark-extension-math';
import sanitizeHTML from 'sanitize-html';

import betterLinkDocumentMod, { BetterLinkDocumentModDecoration } from './private/betterLinkDocumentMod';
import codeBlockCopyButtonDocumentMod from './private/codeBlockCopyButtonDocumentMod';
import iterateLinkDefinitions from './private/iterateLinkDefinitions';
import { pre as respectCRLFPre } from './private/respectCRLF';

const SANITIZE_HTML_OPTIONS = Object.freeze({
  allowedAttributes: {
    a: ['aria-label', 'class', 'href', 'name', 'rel', 'target'],
    button: ['aria-label', 'class', 'type', 'value'],
    img: ['alt', 'aria-label', 'class', 'src', 'title'],
    pre: ['class'],
    span: ['aria-label']
  },
  allowedSchemes: ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'],
  allowedTags: [
    'a',
    'b',
    'blockquote',
    'br',
    'button',
    'caption',
    'code',
    'del',
    'div',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'ins',
    'li',
    'nl',
    'ol',
    'p',
    'pre',
    's',
    'span',
    'strike',
    'strong',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'ul',

    // Followings are for MathML elements, from https://developer.mozilla.org/en-US/docs/Web/MathML.
    'annotation-xml',
    'annotation',
    'math',
    'merror',
    'mfrac',
    'mi',
    'mmultiscripts',
    'mn',
    'mo',
    'mover',
    'mpadded',
    'mphantom',
    'mprescripts',
    'mroot',
    'mrow',
    'ms',
    'mspace',
    'msqrt',
    'mstyle',
    'msub',
    'msubsup',
    'msup',
    'mtable',
    'mtd',
    'mtext',
    'mtr',
    'munder',
    'munderover',
    'semantics'
  ],
  // Bug of https://github.com/apostrophecms/sanitize-html/issues/633.
  // They should not remove `alt=""` even though it is empty.
  nonBooleanAttributes: []
});

type RenderInit = Readonly<{
  codeBlockCopyButtonTagName: string;
  externalLinkAlt: string;
}>;

export default function render(
  markdown: string,
  { markdownRespectCRLF, markdownRenderHTML }: Readonly<{ markdownRespectCRLF: boolean; markdownRenderHTML?: boolean }>,
  { codeBlockCopyButtonTagName, externalLinkAlt }: RenderInit
): string {
  const linkDefinitions = Array.from(iterateLinkDefinitions(markdown));
  const sanitizeHTMLOptions = {
    ...SANITIZE_HTML_OPTIONS,
    allowedAttributes: {
      ...SANITIZE_HTML_OPTIONS.allowedAttributes,
      [codeBlockCopyButtonTagName]: ['data-value']
    },
    allowedTags: [...SANITIZE_HTML_OPTIONS.allowedTags, codeBlockCopyButtonTagName]
  };

  if (markdownRespectCRLF) {
    markdown = respectCRLFPre(markdown);
  }

  const decorate = (href: string, textContent: string): BetterLinkDocumentModDecoration => {
    const decoration: BetterLinkDocumentModDecoration = {
      rel: 'noopener noreferrer',
      target: '_blank',
      wrapZeroWidthSpace: true
    };

    const ariaLabelSegments: string[] = [textContent];
    const classes: Set<string> = new Set();
    const linkDefinition = linkDefinitions.find(({ url }) => url === href);
    const protocol = onErrorResumeNext(() => new URL(href).protocol);

    if (linkDefinition) {
      ariaLabelSegments.push(
        linkDefinition.title || onErrorResumeNext(() => new URL(linkDefinition.url).host) || linkDefinition.url
      );

      // linkDefinition.identifier is uppercase, while linkDefinition.label is as-is.
      linkDefinition.label === textContent && classes.add('webchat__render-markdown__pure-identifier');
    }

    // Let javascript: fell through. Our sanitizer will catch and remove it from <a href>.
    // Otherwise, it will be turn into <button value="javascript:"> and won't able to catch it.

    // False-positive.
    // eslint-disable-next-line no-script-url
    if (protocol !== 'javascript:') {
      // For links that would be sanitized out, let's turn them into a button so we could handle them later.
      if (!sanitizeHTMLOptions.allowedSchemes.map(scheme => `${scheme}:`).includes(protocol)) {
        decoration.asButton = true;

        classes.add('webchat__render-markdown__citation');
      } else if (protocol === 'http:' || protocol === 'https:') {
        decoration.iconAlt = externalLinkAlt;
        decoration.iconClassName = 'webchat__render-markdown__external-link-icon';

        ariaLabelSegments.push(externalLinkAlt);
      }
    }

    // The first segment is textContent. Putting textContent is aria-label is useless.
    if (ariaLabelSegments.length > 1) {
      // If "aria-label" is already applied, do not overwrite it.
      decoration.ariaLabel = (value: string) => value || ariaLabelSegments.join(' ');
    }

    decoration.className = Array.from(classes).join(' ');

    // However, "title" may be narrated by screen reader:
    // - Edge
    //   - <a> will narrate "aria-label" but not "title"
    //   - <button> will narrate both "aria-label" and "title"
    // - NVDA
    //   - <a> will narrate both "aria-label" and "title"
    //   - <button> will narrate both "aria-label" and "title"

    // Title makes it very difficult to control narrations by the screen reader. Thus, we are disabling it in favor of "aria-label".
    // This will not affect our accessibility compliance but UX. We could use a non-native tooltip or other forms of visual hint.

    decoration.title = false;

    return decoration;
  };

  const htmlAfterMarkdown = micromark(markdown, {
    allowDangerousHtml: markdownRenderHTML ?? true,
    // We need to handle links like cite:1 or other URL handlers.
    // And we will remove dangerous protocol during sanitization.
    allowDangerousProtocol: true,
    extensions: [
      gfm(),
      // Disabling single dollar inline math block to prevent easy collision.
      math({ singleDollarTextMath: false })
    ],
    htmlExtensions: [gfmHtml(), mathHtml({ output: 'mathml' })]
  });

  // TODO: [P1] In some future, we should apply "better link" and "sanitization" outside of the Markdown engine.
  //       Particularly, apply them at `useRenderMarkdownAsHTML` instead of inside the default `renderMarkdown`.
  //       If web devs want to bring their own Markdown engine, they don't need to rebuild "better link" and sanitization themselves.

  const documentFragmentAfterMarkdown = parseDocumentFragmentFromString(htmlAfterMarkdown);

  betterLinkDocumentMod(documentFragmentAfterMarkdown, decorate);
  codeBlockCopyButtonDocumentMod(documentFragmentAfterMarkdown, { codeBlockCopyButtonTagName });

  const htmlAfterBetterLink = serializeDocumentFragmentIntoString(documentFragmentAfterMarkdown);

  const htmlAfterSanitization = sanitizeHTML(htmlAfterBetterLink, sanitizeHTMLOptions);

  return htmlAfterSanitization;
}
