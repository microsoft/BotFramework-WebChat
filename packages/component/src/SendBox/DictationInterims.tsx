/* eslint react/no-array-index-key: "off" */

import { Constants } from 'botframework-webchat-core';
import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC } from 'react';

import connectToWebChat from '../connectToWebChat';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const {
  DictateState: { DICTATING, STARTING, STOPPING }
} = Constants;

const { useDictateInterims, useDictateState, useLocalizer } = hooks;

const ROOT_STYLE = {
  alignItems: 'center',
  display: 'flex'
};

const connectDictationInterims = (...selectors) =>
  connectToWebChat(
    ({ dictateInterims, dictateState, language }) => ({
      dictateInterims,
      dictateState,
      language
    }),
    ...selectors
  );

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
    <p className={classNames(dictationInterimsStyleSet + '', rootClassName, (className || '') + '', 'status')}>
      {dictateState === STARTING && localize('SPEECH_INPUT_STARTING')}
    </p>
  ) : (
    dictateState === DICTATING &&
      (dictateInterims.length ? (
        <p className={classNames(dictationInterimsStyleSet + '', rootClassName, (className || '') + '', 'dictating')}>
          {dictateInterims.map((interim, index) => (
            <span key={index}>
              {interim}
              &nbsp;
            </span>
          ))}
        </p>
      ) : (
        <p className={classNames(dictationInterimsStyleSet + '', rootClassName, (className || '') + '', 'status')}>
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

export { connectDictationInterims };
