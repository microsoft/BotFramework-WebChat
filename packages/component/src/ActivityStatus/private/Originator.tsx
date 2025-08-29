import { type OrgSchemaProject } from 'botframework-webchat-core';
import React, { memo } from 'react';
import useSanitizeLinkCallback from '../../hooks/internal/useSanitizeLinkCallback';

type Props = Readonly<{ project: OrgSchemaProject }>;

const Originator = memo(({ project }: Props) => {
  const { name, slogan, url } = project;
  const sanitizeLink = useSanitizeLinkCallback();

  const { sanitizedHref } = sanitizeLink(url);
  const text = slogan || name;

  return sanitizedHref ? (
    // Link is sanitized.
    // eslint-disable-next-line react/forbid-elements
    <a
      className="webchat__activity-status__originator webchat__activity-status__originator--has-link"
      href={sanitizedHref}
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
