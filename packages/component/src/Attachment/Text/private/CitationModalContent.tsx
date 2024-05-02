import classNames from 'classnames';
import React, { Fragment, useCallback } from 'react';
import { sanitize } from 'dompurify';

import useRenderMarkdownAsHTML from '../../../hooks/useRenderMarkdownAsHTML';
import useStyleSet from '../../../hooks/useStyleSet';

type Props = Readonly<{
  headerText?: string;
  markdown: string;
}>;

const CitationModalContent = ({ headerText, markdown }: Props) => {
  const [{ renderMarkdown: renderMarkdownStyleSet }] = useStyleSet();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const domParser = new DOMParser();

  // return the DOM tree if parsing this string returns anything with a non-text HTML node in it, otherwise
  // parse it as Markdown into HTML and return that tree. Sanitizes the output in either case.
  function parseIntoHTML(text: string): HTMLElement {
    // DOMParser is safe; even if it finds potentially dangerous objects, it doesn't run them, just parses them.
    const parsedBody = domParser.parseFromString(text, 'text/html').body;
    // need to use the old-school syntax here for ES version reasons
    for (let i = 0; i < parsedBody.childNodes.length; i++) {
      const node = parsedBody.childNodes[i];
      if (node.nodeType !== Node.TEXT_NODE) {
        return sanitize(parsedBody, { RETURN_DOM: true });
      }
    }
    return sanitize(renderMarkdownAsHTML(text), { RETURN_DOM: true });
  }
  const contents = parseIntoHTML(markdown);
  const renderChildren = useCallback(
    ref => {
      contents.childNodes.forEach(node => ref?.appendChild(node));
    },
    [contents]
  );

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
          ref={renderChildren}
        />
      ) : (
        <div className={classNames('webchat__render-markdown', renderMarkdownStyleSet + '')}>{markdown}</div>
      )}
    </Fragment>
  );
};

CitationModalContent.displayName = 'CitationModalContent';

export default CitationModalContent;
