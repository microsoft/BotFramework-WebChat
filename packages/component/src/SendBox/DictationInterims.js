/* eslint react/no-array-index-key: "off" */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import connectToWebChat from '../connectToWebChat';
import Localize from '../Localization/Localize';
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

const DictationInterims = ({ className, dictateInterims = [], dictateState }) => {
  const [{ dictationInterims: dictationInterimsStyleSet }] = useStyleSet();

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
  className: PropTypes.string,
  dictateInterims: PropTypes.arrayOf(PropTypes.string).isRequired,
  dictateState: PropTypes.number.isRequired
};

// TODO: [P3] After speech started, when clicking on the transcript, it should
//       stop the dictation and allow the user to type-correct the transcript

export default connectDictationInterims()(DictationInterims);

export { connectDictationInterims };
