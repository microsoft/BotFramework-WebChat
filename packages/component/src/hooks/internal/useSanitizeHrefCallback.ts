import { useCallback } from 'react';
import { useTransformHTMLContent } from '../../providers/HTMLContentTransformCOR';

type LinkInfo = {
  openInNewTab: boolean;
  originalHref: string;
  sanitizedHref: string | undefined;
};

export default function useSanitizeHrefCallback(): (href: string) => LinkInfo {
  // Although clumsy, we are using HTML content transformer for sanitizing links.
  // This make sure we have a single centralized facility for sanitization.
  const transformHTMLContent = useTransformHTMLContent();

  return useCallback(
    href => {
      const anchorElement = document.createElement('a');

      anchorElement.setAttribute('href', href || '');

      const fragment = document.createDocumentFragment();

      fragment.append(anchorElement);

      const transformedFragment = transformHTMLContent(fragment);

      const transformedAnchorElement = transformedFragment.querySelector('a');

      return {
        openInNewTab: !!transformedAnchorElement?.getAttribute('target'),
        originalHref: href,
        sanitizedHref: transformedAnchorElement?.getAttribute('href') || undefined
      };
    },
    [transformHTMLContent]
  );
}
