/* eslint react/no-array-index-key: "off" */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import connectToWebChat from '../connectToWebChat';
import Localize from '../Localization/Localize';
import useDictateInterims from '../hooks/useDictateInterims';
import useDictateState from '../hooks/useDictateState';
import useStyleSet from '../hooks/useStyleSet';

const {
  DictateState: { DICTATING, STARTING, STOPPING }
} = Constants;

const ROOT_CSS = css({
  alignItems: 'center',
  display: 'flex'
});

const connectDictationInterims = (...selectors) => {
  console.warn(
    'Web Chat: connectDictationInterims() will be removed on or after 2021-09-27, please use useDictationInterims() instead.'
  );

  return connectToWebChat(
    ({ dictateInterims, dictateState, language }) => ({
      dictateInterims,
      dictateState,
      language
    }),
    ...selectors
  );
};

const useDictationInterims = () => {
  const dictateInterims = useDictateInterims() || [];
  const dictateState = useDictateState();

  return { dictateInterims, dictateState };
};

const DictationInterims = ({ className }) => {
  const { dictateInterims, dictateState } = useDictationInterims();
  const { dictationInterims: dictationInterimsStyleSet } = useStyleSet();

  return dictateState === STARTING || dictateState === STOPPING ? (
    <p className={classNames(dictationInterimsStyleSet + '', ROOT_CSS + '', className + '', 'status')}>
      {dictateState === STARTING && <Localize text="Starting&hellip;" />}
    </p>
  ) : (
    dictateState === DICTATING &&
      (dictateInterims.length ? (
        <p className={classNames(dictationInterimsStyleSet + '', ROOT_CSS + '', className + '', 'dictating')}>
          {dictateInterims.map((interim, index) => (
            <span key={index}>
              {interim}
              &nbsp;
            </span>
          ))}
        </p>
      ) : (
        <p className={classNames(dictationInterimsStyleSet + '', ROOT_CSS + '', className + '', 'status')}>
          <Localize text="Listening&hellip;" />
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

export { connectDictationInterims, useDictationInterims };
