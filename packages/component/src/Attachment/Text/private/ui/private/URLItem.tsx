import React, { memo } from 'react';

import { type Claim } from '../../../../../types/external/SchemaOrg/Claim';

type Props = {
  claim: Claim;
};

const URLItem = memo(({ claim }: Props) => (
  <a className="webchat__link-definitions__item-body--url" href={claim.url} rel="noopener noreferrer" target="_blank">
    {claim.name}
  </a>
));

URLItem.displayName = 'URLItem';

export default URLItem;
