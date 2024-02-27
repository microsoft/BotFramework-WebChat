import type { OrgSchemaClaim } from 'botframework-webchat-core';
import React, { memo } from 'react';

import extractHostnameWithSubdomain from './extractHostnameWithSubdomain';
import ItemBody from './ItemBody';

type Props = Readonly<{
  claim?: OrgSchemaClaim | undefined;
  identifier: string;
  title?: string;
  url: string;
}>;

const URLItem = memo(({ claim, identifier, title, url }: Props) => (
  <a
    className="webchat__link-definitions__list-item-box webchat__link-definitions__list-item-box--as-link"
    href={url}
    rel="noopener noreferrer"
    target="_blank"
  >
    <ItemBody
      claim={claim}
      identifier={identifier}
      isExternal={true}
      title={title || extractHostnameWithSubdomain(url)}
    />
  </a>
));

URLItem.displayName = 'URLItem';

export default URLItem;
