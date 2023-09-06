import React, { memo } from 'react';

import { Claim } from '../../../../../types/external/SchemaOrg/Claim';
import Badge from './Badge';
import OpenInNewWindowIcon from '../OpenInNewWindowIcon';

type Props = {
  claim: Claim;
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  isExternal?: boolean;
};

const ItemBody = memo(({ claim, isExternal }: Props) => {
  const { alternateName } = claim;

  return (
    <div className="webchat__link-definitions__list-item-body">
      {alternateName ? <Badge value={alternateName} /> : null}
      <div className="webchat__link-definitions__list-item-text">{claim.name}</div>
      {isExternal ? <OpenInNewWindowIcon className="webchat__link-definitions__open-in-new-window-icon" /> : null}
    </div>
  );
});

ItemBody.displayName = 'ItemBody';

export default ItemBody;
