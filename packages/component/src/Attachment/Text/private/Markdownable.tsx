import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { useRenderMarkdownAsHTML } from '../../../hooks';

const markdownablePropsSchema = pipe(
  object({
    className: optional(string()),
    id: optional(string()),
    text: string()
  }),
  readonly()
);

type MarkdownableProps = InferInput<typeof markdownablePropsSchema>;

function Markdownable({ className, text, id }: MarkdownableProps) {
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('message activity');

  const innerHTML = useMemo<Readonly<{ __html: string }> | undefined>(
    () => Object.freeze({ __html: renderMarkdownAsHTML?.(text) }),
    [text, renderMarkdownAsHTML]
  );

  return innerHTML ? (
    // eslint-disable-next-line react/no-danger
    <span id={id} className={className} dangerouslySetInnerHTML={innerHTML} />
  ) : (
    <span id={id} className={className}>{text}</span>
  );
}

export default memo(Markdownable);
export { markdownablePropsSchema, type MarkdownableProps };
