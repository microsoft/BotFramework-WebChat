import { useRefFrom } from 'use-ref-from';
import React, { memo, type MouseEventHandler, useCallback } from 'react';

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
      className="webchat__link-definitions__item-body webchat__link-definitions__item-body--citation"
      onClick={handleClick}
      type="button"
    >
      {claim.name}
    </button>
  );
});

CitationItem.displayName = 'CitationItem';

export default CitationItem;
