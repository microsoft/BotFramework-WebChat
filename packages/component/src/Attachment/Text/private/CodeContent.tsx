import classNames from 'classnames';
import React, { Fragment, memo, ReactNode } from 'react';

type Props = Readonly<{
  children?: ReactNode | undefined;
  className?: string | undefined;
  highlightedCode: string;
  title: string;
}>;

const CodeContent = memo(({ children, className, highlightedCode, title }: Props) => (
  <Fragment>
    <div className={'webchat__view-code-dialog__header'}>
      <h2 className={'webchat__view-code-dialog__title'}>{title}</h2>
    </div>
    <div
      className={classNames('webchat__view-code-dialog__body', className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
    {children}
  </Fragment>
));

CodeContent.displayName = 'CodeContent';

export default memo(CodeContent);
