import { useRefFrom } from 'use-ref-from';
import React, { memo, type MouseEventHandler, useCallback } from 'react';

import ItemBody from './ItemBody';
import { type Claim } from '../../../../../types/external/SchemaOrg/Claim';

// Citation is claim with text.
type CitationClaim = Claim & { text: string };

type Props = {
  claim: CitationClaim;
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  onClick?: (citation: CitationClaim) => void;
};

const CitationItem = memo(({ onClick, claim }: Props) => {
  const onClickRef = useRefFrom(onClick);

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    () => onClickRef.current?.(claim),
    [claim, onClickRef]
  );

  return (
    <button
      className="webchat__link-definitions__list-item-box webchat__link-definitions__list-item-box--as-button"
      onClick={handleClick}
      type="button"
    >
      <ItemBody claim={claim} />
    </button>
  );
});

CitationItem.displayName = 'CitationItem';

export default CitationItem;
