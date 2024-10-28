import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { Fragment, memo, ReactNode, useEffect, useState } from 'react';
import { useStyleSet } from '../../../hooks';
import CodeBlockCopyButton from '../../../providers/CustomElements/customElements/CodeBlockCopyButton';
import createHighlighter from './shiki';

type Props = Readonly<{
  children?: ReactNode | undefined;
  className?: string | undefined;
  code: string;
  language?: string | undefined;
  title: string;
}>;

const { useLocalizer } = hooks;

const highlighterPromise = createHighlighter();

const CodeContent = memo(({ children, className, code, language, title }: Props) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const localize = useLocalizer();

  const copiedAlt = localize('COPY_BUTTON_COPIED_TEXT');
  const copyAlt = localize('COPY_BUTTON_TEXT');
  const [{ codeBlockCopyButton: codeBlockCopyButtonClassName }] = useStyleSet();

  useEffect(() => {
    let mounted = true;
    (async function highlight() {
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
        pre.textContent = code;

        setHighlightedCode(pre.outerHTML);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [code, language]);

  return (
    <Fragment>
      <div className={'webchat__view-code-dialog__header'}>
        <h2 className={'webchat__view-code-dialog__title'}>{title}</h2>
        <CodeBlockCopyButton
          className={codeBlockCopyButtonClassName}
          data-alt-copied={copiedAlt}
          data-alt-copy={copyAlt}
          data-value={code}
        />
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
