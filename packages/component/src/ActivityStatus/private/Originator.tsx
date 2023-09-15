import React, { memo } from 'react';

import { type ReplyAction } from '../../types/external/OrgSchema/ReplyAction';

type Props = Readonly<{ replyAction: ReplyAction }>;

const Originator = memo(({ replyAction }: Props) => {
  const { description, provider } = replyAction;

  const text = description || provider?.name;
  const url = provider?.url;

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
