import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { Fragment, memo, useMemo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useRenderMarkdownAsHTML from '../../../hooks/useRenderMarkdownAsHTML';

import styles from './CitationModal.module.css';

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

  const classNames = useStyles(styles);
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('citation modal');
  const html = useMemo(() => ({ __html: renderMarkdownAsHTML(markdown) }), [markdown, renderMarkdownAsHTML]);

  return (
    <Fragment>
      {headerText && <h2 className={classNames['citation-modal-dialog__header']}>{headerText}</h2>}
      {renderMarkdownAsHTML ? (
        <div
          className={cx(classNames['citation-modal-dialog__body'], 'render-markdown')}
          // The content rendered by `renderMarkdownAsHTML` is sanitized.
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={html}
        />
      ) : (
        <div className="render-markdown">{markdown}</div>
      )}
    </Fragment>
  );
}

export default memo(CitationModalContent);
export { citationModalContentPropsSchema, type CitationModalContentProps };
