import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';

import styles from '../LinkDefinitions.module.css';

type Props = Readonly<{ value: string }>;

const Badge = memo(({ value }: Props) => {
  const classNames = useStyles(styles);

  return (
    <div className={classNames['link-definitions__badge']} title={value}>
      {value}
    </div>
  );
});

Badge.displayName = 'Badge';

export default Badge;
