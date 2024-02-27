import type { OrgSchemaClaim } from 'botframework-webchat-core';
import React, { memo, useCallback, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';

import ItemBody from './ItemBody';

type Props = Readonly<{
  claim: OrgSchemaClaim;
  identifier: string;
  onClick?: (url: string) => void;
  title?: string;
  url: string;
}>;

const CitationItem = memo(({ claim, identifier, onClick, title, url }: Props) => {
  const onClickRef = useRefFrom(onClick);
  const urlHref = useRefFrom(url);

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    () => onClickRef.current?.(urlHref.current),
    [onClickRef, urlHref]
  );

  return (
    <button
      className="webchat__link-definitions__list-item-box webchat__link-definitions__list-item-box--as-button"
      onClick={handleClick}
      type="button"
    >
      <ItemBody claim={claim} identifier={identifier} title={title} />
    </button>
  );
});

CitationItem.displayName = 'CitationItem';

export default CitationItem;
