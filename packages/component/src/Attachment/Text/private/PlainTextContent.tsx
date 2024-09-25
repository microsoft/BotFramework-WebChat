import classNames from 'classnames';
import React, { Fragment, memo, type ReactNode } from 'react';

import useStyleSet from '../../../hooks/useStyleSet';

type Props = Readonly<{ children?: ReactNode | undefined; text: string }>;

const PlainTextContent = memo(({ children, text }: Props) => {
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
      {children && (
        <div
          className={classNames('webchat__text-content', 'webchat__text-content--children', textContentStyleSet + '')}
        >
          {children}
        </div>
      )}
    </Fragment>
  );
});

PlainTextContent.displayName = 'PlainTextContent';

export default PlainTextContent;
