import { onErrorResumeNext } from 'botframework-webchat-core';
import type { BetterLinkDocumentModDecoration } from './betterLinkDocumentMod';
import type { MarkdownLinkDefinition } from './extractDefinitionsFromEvents';
import { sanitizeUri } from 'micromark-util-sanitize-uri';

export const ALLOWED_SCHEMES = ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'];

export function createDecorate(
  definitions: readonly MarkdownLinkDefinition[],
  externalLinkAlt: string
): (href: string, textContent: string) => BetterLinkDocumentModDecoration {
  const linkDefinitions = definitions.map(definition =>
    Object.freeze({
      ...definition,
      markupUrl: sanitizeUri(definition.url),
      parsedUrl: onErrorResumeNext(() => new URL(definition.url))
    })
  );

  return (href: string, textContent: string): BetterLinkDocumentModDecoration => {
    const decoration: BetterLinkDocumentModDecoration = {
      rel: 'noopener noreferrer',
      target: '_blank',
      wrapZeroWidthSpace: true
    };

    const ariaLabelSegments: string[] = [textContent];
    const classes: Set<string> = new Set();
    const linkDefinition = linkDefinitions.find(({ url, markupUrl }) => url === href || (href && markupUrl === href));
    const protocol = onErrorResumeNext(() => new URL(href).protocol);

    if (linkDefinition) {
      ariaLabelSegments.push(linkDefinition.title || linkDefinition?.parsedUrl?.host || linkDefinition.url);

      // linkDefinition.identifier is uppercase, while linkDefinition.label is as-is.
      linkDefinition.label === textContent && classes.add('render-markdown__pure-identifier');
    }

    // Let javascript: fell through. Our sanitizer will catch and remove it from <a href>.
    // Otherwise, it will be turn into <button value="javascript:"> and won't able to catch it.

    // False-positive.
    // eslint-disable-next-line no-script-url
    if (protocol !== 'javascript:') {
      // For links that would be sanitized out, let's turn them into a button so we could handle them later.
      if (!ALLOWED_SCHEMES.map(scheme => `${scheme}:`).includes(protocol)) {
        decoration.asButton = true;

        classes.add('render-markdown__citation');
      } else if (protocol === 'http:' || protocol === 'https:') {
        decoration.iconAlt = externalLinkAlt;
        decoration.iconClassName = 'render-markdown__external-link-icon';

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
}
