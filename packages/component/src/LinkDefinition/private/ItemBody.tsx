import React, { memo } from 'react';

import Badge from './Badge';
import OpenInNewWindowIcon from './OpenInNewWindowIcon';

type Props = Readonly<{
  // The text (usually a number) displayed at the head of the citation
  identifier?: string;

  // The text displayed as the main link of the citation
  text: string;

  // do we show the external link icon after the link?
  isExternal?: boolean;

  // The text displayed beneath the link as a description
  badgeName?: string;

  // The title of the badge, displayed as a tooltip on the item's description as well as the description's screen-reader content
  badgeTitle?: string;
}>;

const ItemBody = memo(({ badgeName, badgeTitle, identifier, isExternal, text }: Props) => (
  <div className="webchat__link-definitions__list-item-body">
    {identifier ? <Badge value={identifier} /> : null}
    <div className="webchat__link-definitions__list-item-body-main">
      <div className="webchat__link-definitions__list-item-main-text">
        <div className="webchat__link-definitions__list-item-text" title={text}>
          {text}
        </div>
        {isExternal ? <OpenInNewWindowIcon className="webchat__link-definitions__open-in-new-window-icon" /> : null}
      </div>
      {badgeName && (
        <div className="webchat__link-definitions__list-item-badge" title={badgeTitle}>
          {badgeName}
        </div>
      )}
    </div>
  </div>
));

ItemBody.displayName = 'ItemBody';

export default ItemBody;
