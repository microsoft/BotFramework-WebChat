import React, { memo } from 'react';

import Badge from './Badge';
import { Claim } from '../../../../../types/external/SchemaOrg/Claim';

type Props = {
  claim: Claim;
};

const ItemBody = memo(({ claim }: Props) => {
  const { alternateName } = claim;

  return (
    <div className="webchat__link-definitions__list-item-body">
      {alternateName ? <Badge value={alternateName} /> : null}
      <div className="webchat__link-definitions__item-text">{claim.name}</div>
    </div>
  );
});

ItemBody.displayName = 'ItemBody';

export default ItemBody;
