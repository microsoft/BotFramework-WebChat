import classNames from 'classnames';
import React, { memo } from 'react';

import useStyleSet from '../../hooks/useStyleSet';

import { type Person } from '../../types/external/SchemaOrg/Person';

type Props = { person: Person };

const Originator = memo(({ person }: Props) => {
  const [{ originatorActivityStatus }] = useStyleSet();

  return person.url ? (
    <a
      className={classNames(
        'webchat__originator-activity-status webchat__originator-activity-status--link',
        originatorActivityStatus + ''
      )}
      href={person.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {person.description || person.text}
    </a>
  ) : (
    <span className={classNames('webchat__originator-activity-status', originatorActivityStatus + '')}>
      {person.description || person.text}
    </span>
  );
});

Originator.displayName = 'Originator';

export default Originator;
