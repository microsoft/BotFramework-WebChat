import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';

import Badge from './Badge';
import OpenInNewWindowIcon from './OpenInNewWindowIcon';

import styles from '../LinkDefinitions.module.css';

type Props = Readonly<{
  // The text (usually a number) displayed at the head of the citation
  identifier?: string;

  // The text displayed as the main link of the citation
  text: string;

  // If this is true, we show the "external link" icon after the link
  isExternal?: boolean;

  // The text displayed beneath the link as a description
  badgeName?: string;

  // The title of the badge, displayed as a tooltip on the item's description as well as the description's screen-reader content
  badgeTitle?: string;
}>;

const ItemBody = memo(({ badgeName, badgeTitle, identifier, isExternal, text }: Props) => {
  const classNames = useStyles(styles);

  return (
    <div className={classNames['link-definitions__list-item-body']}>
      {identifier ? <Badge value={identifier} /> : null}
      <div className={classNames['link-definitions__list-item-body-main']}>
        <div className={classNames['link-definitions__list-item-main-text']}>
          <div className={classNames['link-definitions__list-item-text']} title={text}>
            {text}
          </div>
          {isExternal ? (
            <OpenInNewWindowIcon className={classNames['link-definitions__open-in-new-window-icon']} />
          ) : null}
        </div>
        {badgeName && (
          <div className={classNames['link-definitions__list-item-badge']} title={badgeTitle}>
            {badgeName}
          </div>
        )}
      </div>
    </div>
  );
});

ItemBody.displayName = 'ItemBody';

export default ItemBody;
