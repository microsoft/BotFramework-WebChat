import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { Fragment, memo, useMemo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useRenderMarkdownAsHTML from '../../../hooks/useRenderMarkdownAsHTML';
import useStyleSet from '../../../hooks/useStyleSet';

const citationModalContentPropsSchema = pipe(
  object({
    headerText: optional(string()),
    markdown: string()
  }),
  readonly()
);

type CitationModalContentProps = InferInput<typeof citationModalContentPropsSchema>;

function CitationModalContent(props: CitationModalContentProps) {
  const { headerText, markdown } = validateProps(citationModalContentPropsSchema, props);

  const [{ renderMarkdown: renderMarkdownStyleSet }] = useStyleSet();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('citation modal');

  const html = useMemo(() => ({ __html: renderMarkdownAsHTML(markdown) }), [markdown, renderMarkdownAsHTML]);

  return (
    <Fragment>
      {headerText && <h2 className="webchat__citation-modal-dialog__header">{headerText}</h2>}
      {renderMarkdownAsHTML ? (
        <div
          className={classNames(
            'webchat__citation-modal-dialog__body',
            'webchat__render-markdown',
            renderMarkdownStyleSet + ''
          )}
          // The content rendered by `renderMarkdownAsHTML` is sanitized.
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={html}
        />
      ) : (
        <div className={classNames('webchat__render-markdown', renderMarkdownStyleSet + '')}>{markdown}</div>
      )}
    </Fragment>
  );
}

export default memo(CitationModalContent);
export { citationModalContentPropsSchema, type CitationModalContentProps };
