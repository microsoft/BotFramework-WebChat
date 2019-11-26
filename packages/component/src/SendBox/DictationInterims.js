/* eslint react/no-array-index-key: "off" */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import connectToWebChat from '../connectToWebChat';
import useDictateInterims from '../hooks/useDictateInterims';
import useDictateState from '../hooks/useDictateState';
import useLocalize from '../hooks/useLocalize';
import useStyleSet from '../hooks/useStyleSet';

const {
  DictateState: { DICTATING, STARTING, STOPPING }
} = Constants;

const ROOT_CSS = css({
  alignItems: 'center',
  display: 'flex'
});

const connectDictationInterims = (...selectors) =>
  connectToWebChat(
    ({ dictateInterims, dictateState, language }) => ({
      dictateInterims,
      dictateState,
      language
    }),
    ...selectors
  );

const DictationInterims = ({ className }) => {
  const [dictateInterims] = useDictateInterims();
  const [dictateState] = useDictateState();
  const [{ dictationInterims: dictationInterimsStyleSet }] = useStyleSet();

  const listeningText = useLocalize('Listening\u2026');
  const startingText = useLocalize('Starting\u2026');

  return dictateState === STARTING || dictateState === STOPPING ? (
    <p className={classNames(dictationInterimsStyleSet + '', ROOT_CSS + '', className + '', 'status')}>
      {dictateState === STARTING && startingText}
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
          {listeningText}
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
