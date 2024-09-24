import { type OrgSchemaProject } from 'botframework-webchat-core';
import React, { memo } from 'react';

type Props = Readonly<{ project: OrgSchemaProject }>;

const Originator = memo(({ project }: Props) => {
  const { name, slogan, url } = project;

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
