import classNames from 'classnames';
import React, { memo } from 'react';

import { type ReplyAction } from '../../types/external/OrgSchema/ReplyAction';
import useStyleSet from '../../hooks/useStyleSet';

type Props = { replyAction: ReplyAction };

const Originator = memo(({ replyAction }: Props) => {
  const [{ originatorActivityStatus }] = useStyleSet();
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
    <span className={classNames('webchat__activity-status__originator', originatorActivityStatus + '')}>{text}</span>
  );
});

Originator.displayName = 'Originator';

export default Originator;
