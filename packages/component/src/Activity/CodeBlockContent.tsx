import { useStyles } from 'botframework-webchat-styles/react';
import { validateProps } from 'botframework-webchat-react-valibot';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useCodeBlockTag from '../providers/CustomElements/useCodeBlockTagName';

import styles from './CodeBlockContent.module.css';

const codeBlockContentPropsSchema = pipe(
  object({
    code: string(),
    language: optional(string()),
    title: optional(string())
  }),
  readonly()
);

type CodeBlockContentProps = InferInput<typeof codeBlockContentPropsSchema>;

function CodeBlockContent(props: CodeBlockContentProps) {
  const { code, language, title } = validateProps(codeBlockContentPropsSchema, props);
  const classNames = useStyles(styles);
  const [, CodeBlock] = useCodeBlockTag();

  return (
    <div className={classNames['code-block-content']}>
      {title && (
        <div className={cx(classNames['code-block-content__header'])}>
          <div className={cx(classNames['code-block-content__title'])}>{title}</div>
        </div>
      )}
      <CodeBlock className={cx(classNames['code-block-content__code-block'])} language={language}>
        <code>{code}</code>
      </CodeBlock>
    </div>
  );
}

export default memo(CodeBlockContent);
export { codeBlockContentPropsSchema, type CodeBlockContentProps };
