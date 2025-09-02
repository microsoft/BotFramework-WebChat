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
    // "id" is required for "aria-labelledby"
    // eslint-disable-next-line react/forbid-dom-props, react/no-danger
    <span className={className} dangerouslySetInnerHTML={innerHTML} id={id} />
  ) : (
    // "id" is required for "aria-labelledby"
    // eslint-disable-next-line react/forbid-dom-props
    <span className={className} id={id}>
      {text}
    </span>
  );
}

export default memo(Markdownable);
export { markdownablePropsSchema, type MarkdownableProps };
