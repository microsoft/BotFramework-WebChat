import classNames from 'classnames';
import React, { type FC, Fragment, memo } from 'react';

import useStyleSet from '../../hooks/useStyleSet';

type Props = {
  text: string;
};

const PlainTextContent: FC<Props> = memo(({ text }: Props) => {
  const [{ textContent: textContentStyleSet }] = useStyleSet();

  return (
    <Fragment>
      {(text || '').split('\n').map((line, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <p className={classNames('plain', textContentStyleSet + '')} key={index}>
          {line.trim()}
        </p>
      ))}
    </Fragment>
  );
});

PlainTextContent.displayName = 'PlainTextContent';

export default PlainTextContent;
