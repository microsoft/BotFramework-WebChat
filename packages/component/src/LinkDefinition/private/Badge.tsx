import React, { memo } from 'react';

type Props = Readonly<{ value: string }>;

const Badge = memo(({ value }: Props) => (
  <div className="webchat__link-definitions__badge" title={value}>
    {value}
  </div>
));

Badge.displayName = 'Badge';

export default Badge;
