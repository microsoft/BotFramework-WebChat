/* eslint react/no-array-index-key: "off" */

import { hooks } from 'botframework-webchat-api';
import { Constants } from 'botframework-webchat-core';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC } from 'react';

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useStyleSet from '../hooks/useStyleSet';
import testIds from '../testIds';

const {
  DictateState: { DICTATING, STARTING, STOPPING }
} = Constants;

const { useDictateInterims, useDictateState, useLocalizer } = hooks;

const ROOT_STYLE = {
  alignItems: 'center',
  display: 'flex'
};

type DictationInterimsProps = {
  className?: string;
};

const DictationInterims: FC<DictationInterimsProps> = ({ className }) => {
  const [dictateInterims] = useDictateInterims();
  const [dictateState] = useDictateState();
  const [{ dictationInterims: dictationInterimsStyleSet }] = useStyleSet();
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return dictateState === STARTING || dictateState === STOPPING ? (
    <p
      className={classNames(dictationInterimsStyleSet + '', rootClassName, (className || '') + '', 'status')}
      data-testid={testIds.sendBoxSpeechBox}
    >
      {dictateState === STARTING && localize('SPEECH_INPUT_STARTING')}
    </p>
  ) : (
    dictateState === DICTATING &&
      (dictateInterims.length ? (
        <p
          className={classNames(dictationInterimsStyleSet + '', rootClassName, (className || '') + '', 'dictating')}
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
        <p
          className={classNames(dictationInterimsStyleSet + '', rootClassName, (className || '') + '', 'status')}
          data-testid={testIds.sendBoxSpeechBox}
        >
          {localize('SPEECH_INPUT_LISTENING')}
        </p>
      ))
  );
};

DictationInterims.defaultProps = {
  className: ''
};

DictationInterims.propTypes = {
  className: PropTypes.string
};

// TODO: [P3] After speech started, when clicking on the transcript, it should
//       stop the dictation and allow the user to type-correct the transcript

export default DictationInterims;
