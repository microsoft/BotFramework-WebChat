import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import { validateProps } from 'botframework-webchat-react-valibot';
import React, { Fragment, memo, useCallback, useMemo } from 'react';
import Say, { SayUtterance } from 'react-say';
import { useRefFrom } from 'use-ref-from';
import { any, array, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useWebSpeechPonyfill from '../hooks/useWebSpeechPonyfill';
import SayAlt from './SayAlt';

const { useMarkActivityAsSpoken, useStyleOptions, useVoiceSelector } = hooks;

// TODO: [P4] Consider moving this feature into BasicActivity
//       And it has better DOM position for showing visual spoken text

const speakableActivitySchema = pipe(
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
);

const speakPropsSchema = pipe(
  object({
    activity: speakableActivitySchema
  }),
  readonly()
);

type SpeakProps = InferInput<typeof speakPropsSchema>;

function Speak(props: SpeakProps) {
  const { activity } = validateProps(speakPropsSchema, props);

  const [{ showSpokenText }] = useStyleOptions();
  const [webSpeechPonyfill] = useWebSpeechPonyfill();
  const activityRef = useRefFrom(activity);
  const markActivityAsSpoken = useMarkActivityAsSpoken();
  const selectVoice = useVoiceSelector(activity);

  const markAsSpoken = useCallback(
    () => markActivityAsSpoken(activityRef.current as WebChatActivity),
    [activityRef, markActivityAsSpoken]
  );

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
      <Fragment>
        {speechSynthesisUtterance ? (
          <SayUtterance
            onEnd={markAsSpoken}
            onError={markAsSpoken}
            ponyfill={webSpeechPonyfill}
            utterance={speechSynthesisUtterance}
          />
        ) : (
          <Say
            onEnd={markAsSpoken}
            onError={markAsSpoken}
            ponyfill={webSpeechPonyfill}
            text={singleLine}
            voice={selectVoice}
          />
        )}
        {!!showSpokenText && <SayAlt speak={singleLine} />}
      </Fragment>
    )
  );
}

export default memo(Speak);
export { speakPropsSchema, type SpeakProps };
