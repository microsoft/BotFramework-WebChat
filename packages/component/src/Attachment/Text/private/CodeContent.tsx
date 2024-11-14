import classNames from 'classnames';
import React, { Fragment, memo, ReactNode } from 'react';
import useCodeBlockTag from '../../../providers/CustomElements/useCodeBlockTagName';

type Props = Readonly<{
  children?: ReactNode | undefined;
  className?: string | undefined;
  theme: string;
  language: string;
  code: string;
  title: string;
}>;

const CodeContent = memo(({ children, className, code, language, theme, title }: Props) => {
  const [, CodeBlock] = useCodeBlockTag();
  return (
    <Fragment>
      <div className={'webchat__view-code-dialog__header'}>
        <h2 className={'webchat__view-code-dialog__title'}>{title}</h2>
      </div>
      <CodeBlock className={classNames('webchat__view-code-dialog__body', className)} language={language} theme={theme}>
        <code>{code}</code>
      </CodeBlock>
      {children}
    </Fragment>
  );
});

CodeContent.displayName = 'CodeContent';

export default memo(CodeContent);
