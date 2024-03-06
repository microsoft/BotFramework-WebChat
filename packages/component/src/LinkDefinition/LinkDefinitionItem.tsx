import React, { memo, useCallback, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';

import extractHostnameWithSubdomain from './private/extractHostnameWithSubdomain';
import ItemBody from './private/ItemBody';

type Props = Readonly<{
  badgeName?: string;
  badgeTitle?: string;
  identifier?: string;
  onClick?: () => void;
  title: string;
  url?: string;
}>;

const LinkDefinitionItem = memo(({ badgeName, badgeTitle, identifier, onClick, title, url }: Props) => {
  const onClickRef = useRefFrom(onClick);

  const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>>(
    event => {
      const { current } = onClickRef;

      if (current) {
        event.preventDefault();
        event.stopPropagation();

        current();
      }
    },
    [onClickRef]
  );

  return url ? (
    // TODO: Add role="listitem".
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
        title={title || extractHostnameWithSubdomain(url)}
      />
    </a>
  ) : (
    // TODO: Add role="listitem".
    <button
      className="webchat__link-definitions__list-item-box webchat__link-definitions__list-item-box--as-button"
      onClick={handleClick}
      type="button"
    >
      <ItemBody badgeName={badgeName} badgeTitle={badgeTitle} identifier={identifier} title={title} />
    </button>
  );
});

LinkDefinitionItem.displayName = 'LinkDefinitionItem';

export default LinkDefinitionItem;
