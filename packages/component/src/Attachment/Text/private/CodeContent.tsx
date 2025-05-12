import { validateProps } from 'botframework-webchat-api/internal';
import classNames from 'classnames';
import React, { Fragment, memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useCodeBlockTag from '../../../providers/CustomElements/useCodeBlockTagName';
import reactNode from '../../../types/internal/reactNode';

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

  return (
    <Fragment>
      <div className={'webchat__view-code-dialog__header'}>
        <h2 className={'webchat__view-code-dialog__title'}>{title}</h2>
      </div>
      <CodeBlock className={classNames('webchat__view-code-dialog__body', className)} language={language}>
        <code>{code}</code>
      </CodeBlock>
      {children}
    </Fragment>
  );
}

export default memo(CodeContent);
export { codeContentPropsSchema, type CodeContentProps };
