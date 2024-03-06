import React, { memo } from 'react';

import Badge from './Badge';
import OpenInNewWindowIcon from './OpenInNewWindowIcon';

type Props = Readonly<{
  badgeText?: string;
  badgeTooltip?: string;
  identifier?: string;
  isExternal?: boolean;
  text: string;
}>;

const ItemBody = memo(({ badgeText, badgeTooltip, identifier, isExternal, text }: Props) => (
  <div className="webchat__link-definitions__list-item-body">
    {identifier ? <Badge value={identifier} /> : null}
    <div className="webchat__link-definitions__list-item-body-main">
      <div className="webchat__link-definitions__list-item-main-text">
        <div className="webchat__link-definitions__list-item-text" title={text}>
          {text}
        </div>
        {isExternal ? <OpenInNewWindowIcon className="webchat__link-definitions__open-in-new-window-icon" /> : null}
      </div>
      {badgeText && (
        <div className="webchat__link-definitions__list-item-badge" title={badgeTooltip}>
          {badgeText}
        </div>
      )}
    </div>
  </div>
));

ItemBody.displayName = 'ItemBody';

export default ItemBody;
