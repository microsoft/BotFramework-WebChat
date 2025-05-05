import React, { memo, useMemo } from 'react';
import { useRenderMarkdownAsHTML } from '../../../hooks';

type MarkdownableProps = Readonly<{
  className?: string | undefined;
  text: string;
}>;

function Markdownable({ className, text }: MarkdownableProps) {
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('message activity');

  const innerHTML = useMemo<Readonly<{ __html: string }> | undefined>(
    () => Object.freeze({ __html: renderMarkdownAsHTML?.(text) }),
    [text, renderMarkdownAsHTML]
  );

  return innerHTML ? (
    // eslint-disable-next-line react/no-danger
    <span className={className} dangerouslySetInnerHTML={innerHTML} />
  ) : (
    <span className={className}>{text}</span>
  );
}

export default memo(Markdownable);
export { type MarkdownableProps };
