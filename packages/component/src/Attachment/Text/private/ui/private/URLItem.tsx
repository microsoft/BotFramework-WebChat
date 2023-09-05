import React, { memo } from 'react';

import ItemBody from './ItemBody';
import { type Claim } from '../../../../../types/external/SchemaOrg/Claim';

type Props = {
  claim: Claim;
};

const URLItem = memo(({ claim }: Props) => (
  <a
    className="webchat__link-definitions__list-item-box webchat__link-definitions__list-item-box--as-link"
    href={claim.url}
    rel="noopener noreferrer"
    target="_blank"
  >
    <ItemBody claim={claim} />
  </a>
));

URLItem.displayName = 'URLItem';

export default URLItem;
