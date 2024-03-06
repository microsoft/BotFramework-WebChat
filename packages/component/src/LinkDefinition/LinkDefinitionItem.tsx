import React, { memo, useCallback, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';

import extractHostnameWithSubdomain from './private/extractHostnameWithSubdomain';
import ItemBody from './private/ItemBody';

type Props = Readonly<{
  badgeText?: string;
  badgeTooltip?: string;
  identifier?: string;
  onClick?: () => void;
  text?: string;
  url?: string;
}>;

const LinkDefinitionItem = memo(({ badgeText, badgeTooltip, identifier, onClick, text, url }: Props) => {
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
    <a
      className="webchat__link-definitions__list-item-box webchat__link-definitions__list-item-box--as-link"
      href={url}
      onClick={handleClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      <ItemBody
        badgeText={badgeText}
        badgeTooltip={badgeTooltip}
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
      <ItemBody badgeText={badgeText} badgeTooltip={badgeTooltip} identifier={identifier} text={text} />
    </button>
  );
});

LinkDefinitionItem.displayName = 'LinkDefinitionItem';

export default LinkDefinitionItem;
