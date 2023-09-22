import React, { memo } from 'react';

import Badge from './Badge';
import OpenInNewWindowIcon from './OpenInNewWindowIcon';

type Props = Readonly<{
  identifier: string;
  isExternal?: boolean;
  title: string;
}>;

const ItemBody = memo(({ identifier, isExternal, title }: Props) => (
  <div className="webchat__link-definitions__list-item-body">
    {identifier ? <Badge value={identifier} /> : null}
    <div className="webchat__link-definitions__list-item-text">{title}</div>
    {isExternal ? <OpenInNewWindowIcon className="webchat__link-definitions__open-in-new-window-icon" /> : null}
  </div>
));

ItemBody.displayName = 'ItemBody';

export default ItemBody;
