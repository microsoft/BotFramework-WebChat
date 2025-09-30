import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { Fragment, memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useCodeBlockTag from '../../../providers/CustomElements/useCodeBlockTagName';

import styles from './ViewCodeDialog.module.css';

const codeContentPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    code: string(),
    language: string(),
    title: string()
  }),
  readonly()
);

type CodeContentProps = InferInput<typeof codeContentPropsSchema>;

function CodeContent(props: CodeContentProps) {
  const { children, className, code, language, title } = validateProps(codeContentPropsSchema, props);

  const [, CodeBlock] = useCodeBlockTag();
  const classNames = useStyles(styles);

  return (
    <Fragment>
      <div className={classNames['view-code-dialog__header']}>
        <h2 className={classNames['view-code-dialog__title']}>{title}</h2>
      </div>
      <CodeBlock className={cx(classNames['view-code-dialog__body'], className)} language={language}>
        <code>{code}</code>
      </CodeBlock>
      {children}
    </Fragment>
  );
}

export default memo(CodeContent);
export { codeContentPropsSchema, type CodeContentProps };
