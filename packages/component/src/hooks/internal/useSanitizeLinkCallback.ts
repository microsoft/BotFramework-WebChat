import { useCallback } from 'react';
import { useTransformHTMLContent } from '../../providers/HTMLContentTransformCOR';

type LinkInfo = {
  originalHref: string;
  sanitizedHref: string | undefined;
  target: string | undefined;
};

export default function useSanitizeLinkCallback(): (href: string) => LinkInfo {
  const transformHTMLContent = useTransformHTMLContent();

  return useCallback(
    href => {
      const anchorElement = document.createElement('a');

      anchorElement.setAttribute('href', href);

      const fragment = document.createDocumentFragment();

      fragment.append(anchorElement);

      const transformedFragment = transformHTMLContent(fragment);

      const transformedAnchorElement = transformedFragment.querySelector('a');

      return {
        originalHref: href,
        sanitizedHref: transformedAnchorElement?.getAttribute('href') || undefined,
        target: transformedAnchorElement?.getAttribute('target') || undefined
      };
    },
    [transformHTMLContent]
  );
}
