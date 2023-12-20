import classNames from 'classnames';
import React, { type ReactNode, Fragment, memo } from 'react';

import useStyleSet from '../../../hooks/useStyleSet';

type Props = Readonly<{ text: string }>;

const PlainTextContent = memo(({ text }: Props): ReactNode => {
  const [{ textContent: textContentStyleSet }] = useStyleSet();

  return (
    <Fragment>
      {(text || '').split('\n').map(line => (
        <p
          className={classNames('webchat__text-content', 'webchat__text-content--is-plain', textContentStyleSet + '')}
          key={line}
        >
          {line.trim()}
        </p>
      ))}
    </Fragment>
  );
});

PlainTextContent.displayName = 'PlainTextContent';

export default PlainTextContent;
