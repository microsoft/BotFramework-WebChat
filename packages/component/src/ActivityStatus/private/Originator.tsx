import classNames from 'classnames';
import React, { memo } from 'react';

import { type ReplyAction } from '../../types/external/SchemaOrg/ReplyAction';
import useStyleSet from '../../hooks/useStyleSet';

type Props = { replyAction: ReplyAction };

const Originator = memo(({ replyAction }: Props) => {
  const [{ originatorActivityStatus }] = useStyleSet();
  const { description, provider } = replyAction;

  const text = description || provider?.name;
  const url = provider?.url;

  return url ? (
    <a
      className={classNames(
        'webchat__originator-activity-status webchat__originator-activity-status--link',
        originatorActivityStatus + ''
      )}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {text}
    </a>
  ) : (
    <span className={classNames('webchat__originator-activity-status', originatorActivityStatus + '')}>{text}</span>
  );
});

Originator.displayName = 'Originator';

export default Originator;
