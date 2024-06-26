import React, { memo, useCallback, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';

import ItemBody from './private/ItemBody';
import extractHostnameWithSubdomain from './private/extractHostnameWithSubdomain';

type Props = Readonly<{
  // The text (usually a number) displayed to the left of the item (e.g. "1")
  identifier?: string;

  // The main text of the citation. This will be formatted as if it were a link. If this is nullish and a URL exists, its host will be displayed instead.
  text?: string;

  // Displayed beneath the main link of the citation if it exists
  badgeName?: string;

  // Used as a tooltip and ARIA label for the item's displayed badgeName
  badgeTitle?: string;

  // If the citation is an external link, this is its destination.
  url?: string;

  onClick?: (event: Pick<CustomEvent, 'defaultPrevented' | 'preventDefault' | 'type'>) => void;
}>;

const LinkDefinitionItem = memo(({ badgeName, badgeTitle, identifier, onClick, text, url }: Props) => {
  const onClickRef = useRefFrom(onClick);

  const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>>(
    event => {
      const { current } = onClickRef;

      if (current) {
        const customEvent = new CustomEvent('click');

        current(customEvent);

        customEvent.defaultPrevented && event.preventDefault();
      }
    },
    [onClickRef]
  );

  return url ? (
    <a
      className="webchat__link-definitions__list-item-box webchat__link-definitions__list-item-box--as-link"
      href={url}
      onClick={handleClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      <ItemBody
        badgeName={badgeName}
        badgeTitle={badgeTitle}
        identifier={identifier}
        isExternal={true}
        text={text || extractHostnameWithSubdomain(url)}
      />
    </a>
  ) : (
    <button
      className="webchat__link-definitions__list-item-box webchat__link-definitions__list-item-box--as-button"
      onClick={handleClick}
      type="button"
    >
      <ItemBody badgeName={badgeName} badgeTitle={badgeTitle} identifier={identifier} text={text} />
    </button>
  );
});

LinkDefinitionItem.displayName = 'LinkDefinitionItem';

export default LinkDefinitionItem;
