import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { Fragment, memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import styles from '../TextContent.module.css';

const plainTextContentPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    text: string()
  }),
  readonly()
);

type PlainTextContentProps = InferInput<typeof plainTextContentPropsSchema>;

function PlainTextContent(props: PlainTextContentProps) {
  const { children, text } = validateProps(plainTextContentPropsSchema, props);

  const classNames = useStyles(styles);

  return (
    <Fragment>
      {(text || '').split('\n').map(line => (
        <p className={cx(classNames['text-content'])} key={line}>
          {line.trim()}
        </p>
      ))}
      {children && <div className={classNames['text-content']}>{children}</div>}
    </Fragment>
  );
}

export default memo(PlainTextContent);
export { plainTextContentPropsSchema, type PlainTextContentProps };
