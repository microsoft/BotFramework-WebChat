import React, { Fragment, memo, ReactNode, useEffect, useState } from 'react';
import classNames from 'classnames';
import createHighlighter from './shiki';

type Props = Readonly<{
  children?: ReactNode | undefined;
  className?: string | undefined;
  code: string;
  language?: string | undefined;
  title: string;
}>;

const highlighterPromise = createHighlighter();

const CodeContent = memo(({ children, className, code, language, title }: Props) => {
  const [highlightedCode, setHighlightedCode] = useState('');

  useEffect(() => {
    let mounted = true;
    async function highlight() {
      const highlighter = await highlighterPromise;
      if (!mounted) {
        return;
      }
      try {
        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme: 'github-light-default'
        });

        setHighlightedCode(html);
      } catch (error) {
        console.error('botframework-webchat: Failed to highlight code:', error);

        const pre = document.createElement('pre');
        pre.innerText = code;

        setHighlightedCode(pre.outerHTML);
      }
    }

    highlight();
    return () => {
      mounted = false;
    };
  }, [code, language]);

  return (
    <Fragment>
      <div className={'webchat__view-code-dialog__header'}>
        <h2 className={'webchat__view-code-dialog__title'}>{title}</h2>
        {/* <CopyCodeButton htmlText={highlightedCode} plainText={code} /> */}
      </div>
      <div
        className={classNames('webchat__view-code-dialog__body', className)}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
      {children}
    </Fragment>
  );
});

CodeContent.displayName = 'CodeContent';

export default memo(CodeContent);
