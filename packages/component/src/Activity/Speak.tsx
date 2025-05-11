import { hooks } from 'botframework-webchat-api';
import React, { memo, useCallback, useMemo } from 'react';
import ReactSay, { SayUtterance } from 'react-say';

import type { WebChatActivity } from 'botframework-webchat-core';
import { any, array, object, optional, pipe, readonly, string, type InferInput } from 'valibot';
import parseProps from '../Utils/parseProps';
import SayAlt from './SayAlt';

// TODO: [P1] Interop between Babel and esbuild.
const Say = 'default' in ReactSay ? ReactSay.default : ReactSay;
const { useMarkActivityAsSpoken, useStyleOptions, useVoiceSelector } = hooks;

// TODO: [P4] Consider moving this feature into BasicActivity
//       And it has better DOM position for showing visual spoken text

const speakPropsSchema = pipe(
  object({
    activity: pipe(
      object({
        attachments: optional(
          pipe(
            array(
              pipe(
                object({
                  content: optional(any()),
                  contentType: string(),
                  speak: optional(string()),
                  subtitle: optional(string()),
                  text: optional(string()),
                  title: optional(string())
                }),
                readonly()
              )
            ),
            readonly()
          )
        ),
        channelData: optional(
          pipe(
            object({
              speechSynthesisUtterance: optional(any())
            }),
            readonly()
          )
        ),
        speak: optional(string()),
        text: optional(string()),
        type: string()
      }),
      readonly()
    )
  }),
  readonly()
);

type SpeakProps = InferInput<typeof speakPropsSchema>;

function Speak(props: SpeakProps) {
  const { activity } = parseProps(speakPropsSchema, props);

  const [{ showSpokenText }] = useStyleOptions();
  const markActivityAsSpoken = useMarkActivityAsSpoken();
  const selectVoice = useVoiceSelector(activity);

  const markAsSpoken = useCallback(() => {
    markActivityAsSpoken(activity as WebChatActivity);
  }, [activity, markActivityAsSpoken]);

  const singleLine: false | string = useMemo(() => {
    if (activity.type !== 'message') {
      return false;
    }

    const { attachments = [], speak, text } = activity;

    return [
      speak || text,
      ...attachments
        .filter(
          (
            attachment
          ): attachment is {
            content: { speak?: string };
            contentType: 'application/vnd.microsoft.card.adaptive';
          } => attachment.contentType === 'application/vnd.microsoft.card.adaptive' && attachment.content
        )
        .map(attachment => attachment?.content?.speak)
    ]
      .filter(line => line)
      .join('\r\n');
  }, [activity]);

  const speechSynthesisUtterance: false | SpeechSynthesisUtterance | undefined =
    activity.type === 'message' && activity.channelData?.speechSynthesisUtterance;

  return (
    !!activity && (
      <React.Fragment>
        {speechSynthesisUtterance ? (
          <SayUtterance onEnd={markAsSpoken} onError={markAsSpoken} utterance={speechSynthesisUtterance} />
        ) : (
          <Say onEnd={markAsSpoken} onError={markAsSpoken} text={singleLine} voice={selectVoice} />
        )}
        {!!showSpokenText && <SayAlt speak={singleLine} />}
      </React.Fragment>
    )
  );
}

export default memo(Speak);
export { speakPropsSchema, type SpeakProps };
