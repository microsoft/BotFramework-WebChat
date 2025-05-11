import { parseProps } from 'botframework-webchat-component/internal';
import React, { memo } from 'react';
import { any, boolean, object, optional, pipe, readonly, type InferInput } from 'valibot';

import AdaptiveCardContent from './AdaptiveCardContent';

const adaptiveCardAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        content: optional(any())
      }),
      readonly()
    ),
    disabled: optional(boolean())
  }),
  readonly()
);

type AdaptiveCardAttachmentProps = InferInput<typeof adaptiveCardAttachmentPropsSchema>;

function AdaptiveCardAttachment(props: AdaptiveCardAttachmentProps) {
  const {
    attachment: { content },
    disabled
  } = parseProps(adaptiveCardAttachmentPropsSchema, props);

  return <AdaptiveCardContent content={content} disabled={disabled} />;
}

export default memo(AdaptiveCardAttachment);
export { adaptiveCardAttachmentPropsSchema, type AdaptiveCardAttachmentProps };
