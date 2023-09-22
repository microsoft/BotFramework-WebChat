import classNames from 'classnames';
import React, { type FC, Fragment, memo } from 'react';

import useStyleSet from '../../../hooks/useStyleSet';

type Props = Readonly<{ text: string }>;

const PlainTextContent: FC<Props> = memo(({ text }: Props) => {
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
