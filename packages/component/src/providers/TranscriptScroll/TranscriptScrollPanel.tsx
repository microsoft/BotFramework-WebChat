import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { Panel as ReactScrollToBottomPanel } from 'react-scroll-to-bottom';
import { object, optional, pipe, readonly, string } from 'valibot';

const transcriptScrollPanelPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string())
  }),
  readonly()
);

type TranscriptScrollPanelProps = InferReactProps<typeof transcriptScrollPanelPropsSchema>;

// The scrollable element. Children are rendered as-is, without any wrapper.
function TranscriptScrollPanel(props: TranscriptScrollPanelProps) {
  const { children, className } = validateProps(transcriptScrollPanelPropsSchema, props);

  return <ReactScrollToBottomPanel className={className}>{children}</ReactScrollToBottomPanel>;
}

TranscriptScrollPanel.displayName = 'TranscriptScrollPanel';

export default memo(TranscriptScrollPanel);
export { transcriptScrollPanelPropsSchema, type TranscriptScrollPanelProps };
