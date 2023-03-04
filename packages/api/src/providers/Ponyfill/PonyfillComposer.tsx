import PropTypes from 'prop-types';
import React, { useMemo, useRef } from 'react';

import PonyfillContext from './private/PonyfillContext';

import type { ContextOf } from '../../types/internal/ContextOf';
import type { GlobalScopePonyfill } from 'botframework-webchat-core';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  partialPonyfill?: Partial<GlobalScopePonyfill>;
}>;

const PonyfillComposer = ({ children, partialPonyfill }: Props) => {
  // Note: `useRef(value)` always return the initial value that was called.
  if (useRef(partialPonyfill).current !== partialPonyfill) {
    // We does not support changing ponyfill. This is because ponyfill is used to create Redux store.
    // Once the store is created, we cannot change its ponyfill.
    // However, we could rework the `createStore` function to support changing ponyfill.
    // This is just for simpler code and we could relax it if there are needs.
    throw new Error('botframework-webchat: "ponyfill" props cannot be changed after initial render.');
  }

  const ponyfill = useMemo<GlobalScopePonyfill>(
    () => ({
      // Using clock functions from global if not provided.
      // eslint-disable-next-line no-restricted-globals
      cancelAnimationFrame: partialPonyfill?.cancelAnimationFrame || cancelAnimationFrame,
      // eslint-disable-next-line no-restricted-globals
      cancelIdleCallback: partialPonyfill?.cancelIdleCallback || cancelIdleCallback,
      // eslint-disable-next-line no-restricted-globals
      clearImmediate: partialPonyfill?.clearImmediate || clearImmediate,
      // eslint-disable-next-line no-restricted-globals
      clearInterval: partialPonyfill?.clearInterval || clearInterval,
      // eslint-disable-next-line no-restricted-globals
      clearTimeout: partialPonyfill?.clearTimeout || clearTimeout,
      // eslint-disable-next-line no-restricted-globals
      Date: partialPonyfill?.Date || Date,
      // eslint-disable-next-line no-restricted-globals
      requestAnimationFrame: partialPonyfill?.requestAnimationFrame || requestAnimationFrame,
      // eslint-disable-next-line no-restricted-globals
      requestIdleCallback: partialPonyfill?.requestIdleCallback || requestIdleCallback,
      // eslint-disable-next-line no-restricted-globals
      setImmediate: partialPonyfill?.setImmediate || setImmediate,
      // eslint-disable-next-line no-restricted-globals
      setInterval: partialPonyfill?.setInterval || setInterval,
      // eslint-disable-next-line no-restricted-globals
      setTimeout: partialPonyfill?.setTimeout || setTimeout
    }),
    [partialPonyfill]
  );

  const contextValue = useMemo<Exclude<ContextOf<typeof PonyfillContext>, undefined>>(
    () => ({
      ponyfillState: Object.freeze([ponyfill]) as readonly [GlobalScopePonyfill]
    }),
    [ponyfill]
  );

  return <PonyfillContext.Provider value={contextValue}>{children}</PonyfillContext.Provider>;
};

PonyfillComposer.defaultProps = {
  partialPonyfill: undefined
};

PonyfillComposer.propTypes = {
  partialPonyfill: PropTypes.any
};

export default PonyfillComposer;
