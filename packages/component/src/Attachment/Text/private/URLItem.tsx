import React, { memo } from 'react';

import extractHostnameWithSubdomain from './extractHostnameWithSubdomain';
import ItemBody from './ItemBody';

type Props = {
  identifier: string;
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  title?: string;
  url: string;
};

const URLItem = memo(({ identifier, title, url }: Props) => (
  <a
    className="webchat__link-definitions__list-item-box webchat__link-definitions__list-item-box--as-link"
    href={url}
    rel="noopener noreferrer"
    target="_blank"
  >
    <ItemBody identifier={identifier} isExternal={true} title={title || extractHostnameWithSubdomain(url)} />
  </a>
));

URLItem.displayName = 'URLItem';

export default URLItem;
