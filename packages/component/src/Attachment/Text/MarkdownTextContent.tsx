import classNames from 'classnames';
import React, { memo, useMemo } from 'react';

import useRenderMarkdownAsHTML from '../../hooks/useRenderMarkdownAsHTML';
import useStyleSet from '../../hooks/useStyleSet';

type Props = {
  markdown: string;
};

const MarkdownTextContent = memo(({ markdown }: Props) => {
  const [{ textContent: textContentStyleSet }] = useStyleSet();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();

  if (!renderMarkdownAsHTML) {
    throw new Error('botframework-webchat: assert failed for renderMarkdownAsHTML');
  }

  // The content rendered by `renderMarkdownAsHTML` is sanitized.
  const dangerouslySetInnerHTML = useMemo(
    () => ({ __html: markdown ? renderMarkdownAsHTML(markdown) : '' }),
    [renderMarkdownAsHTML, markdown]
  );

  return (
    <div
      // TODO: Fix this class name.
      className={classNames('markdown', textContentStyleSet + '')}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    />
  );
});

MarkdownTextContent.displayName = 'MarkdownTextContent';

export default MarkdownTextContent;
