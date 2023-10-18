import React, { memo } from 'react';

import { OrgSchemaProject } from 'botframework-webchat-core';

type Props = Readonly<{ claimInterpreter: OrgSchemaProject }>;

const Originator = memo(({ claimInterpreter }: Props) => {
  const { name, slogan, url } = claimInterpreter;

  const text = slogan || name;

  return url ? (
    <a
      className="webchat__activity-status__originator webchat__activity-status__originator--has-link"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {text}
    </a>
  ) : (
    <span className="webchat__activity-status__originator">{text}</span>
  );
});

Originator.displayName = 'Originator';

export default Originator;
