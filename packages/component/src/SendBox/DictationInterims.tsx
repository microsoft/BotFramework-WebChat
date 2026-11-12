/* eslint react/no-array-index-key: "off" */

import { hooks } from 'botframework-webchat-api';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { Constants } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import testIds from '../testIds';
import styles from './SendBox.module.css';

const {
  DictateState: { DICTATING, STARTING, STOPPING }
} = Constants;

const { useDictateInterims, useDictateState, useLocalizer } = hooks;

const dictationInterimsPropsSchema = pipe(
  object({
    className: optional(string())
  }),
  readonly()
);

type DictationInterimsProps = InferInput<typeof dictationInterimsPropsSchema>;

function DictationInterims(props: DictationInterimsProps) {
  const { className } = validateProps(dictationInterimsPropsSchema, props);

  const classNames = useStyles(styles, webChatPrefixedClassName);
  const [dictateInterims] = useDictateInterims();
  const [dictateState] = useDictateState();
  const localize = useLocalizer();

  return dictateState === STARTING || dictateState === STOPPING ? (
    <p className={cx(classNames['dictation-interims'], className, 'status')} data-testid={testIds.sendBoxSpeechBox}>
      {dictateState === STARTING && localize('SPEECH_INPUT_STARTING')}
    </p>
  ) : (
    dictateState === DICTATING &&
      (dictateInterims.length ? (
        <p
          className={cx(classNames['dictation-interims'], className, 'dictating')}
          data-testid={testIds.sendBoxSpeechBox}
        >
          {dictateInterims.map((interim, index) => (
            <span key={index}>
              {interim}
              &nbsp;
            </span>
          ))}
        </p>
      ) : (
        <p className={cx(classNames['dictation-interims'], className, 'status')} data-testid={testIds.sendBoxSpeechBox}>
          {localize('SPEECH_INPUT_LISTENING')}
        </p>
      ))
  );
}

// TODO: [P3] After speech started, when clicking on the transcript, it should
//       stop the dictation and allow the user to type-correct the transcript

export default memo(DictationInterims);
export { dictationInterimsPropsSchema, type DictationInterimsProps };
