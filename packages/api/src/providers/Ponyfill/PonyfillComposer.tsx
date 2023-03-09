import PropTypes from 'prop-types';
import React, { useMemo, useRef } from 'react';

import PonyfillContext from './private/PonyfillContext';

import type { ContextOf } from '../../types/internal/ContextOf';
import type { GlobalScopePonyfill } from 'botframework-webchat-core';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  ponyfill?: Partial<GlobalScopePonyfill>;
}>;

const PonyfillComposer = ({ children, ponyfill: partialPonyfill }: Props) => {
  // Note: `useRef(value)` always return the initial value that was called with.
  if (useRef(partialPonyfill).current !== partialPonyfill) {
    // We does not support changing ponyfill.
    // This is because ponyfill is used to create Redux store (if not passed via props).
    // Once the store is created, we cannot change its ponyfill.
    // However, we could rework the `createStore` function to support changing ponyfill.
    // Locking down ponyfill is just for code simplicity.
    throw new Error('botframework-webchat: "ponyfill" props cannot be changed after initial render.');
  }

  // TODO: [P2] Dedupe: when we have an utility package, move this code there and mark it as internal use.
  const ponyfill = useMemo<GlobalScopePonyfill>(
    () => ({
      // Using clock functions from global if not provided.
      // eslint-disable-next-line no-restricted-globals
      cancelAnimationFrame: partialPonyfill?.cancelAnimationFrame || cancelAnimationFrame.bind(globalThis),
      // eslint-disable-next-line no-restricted-globals
      cancelIdleCallback: partialPonyfill?.cancelIdleCallback || cancelIdleCallback.bind(globalThis),
      // eslint-disable-next-line no-restricted-globals
      clearImmediate: partialPonyfill?.clearImmediate || clearImmediate.bind(globalThis),
      // eslint-disable-next-line no-restricted-globals
      clearInterval: partialPonyfill?.clearInterval || clearInterval.bind(globalThis),
      // eslint-disable-next-line no-restricted-globals
      clearTimeout: partialPonyfill?.clearTimeout || clearTimeout.bind(globalThis),
      // eslint-disable-next-line no-restricted-globals
      Date: partialPonyfill?.Date || Date,
      // eslint-disable-next-line no-restricted-globals
      requestAnimationFrame: partialPonyfill?.requestAnimationFrame || requestAnimationFrame.bind(globalThis),
      // eslint-disable-next-line no-restricted-globals
      requestIdleCallback: partialPonyfill?.requestIdleCallback || requestIdleCallback.bind(globalThis),
      // eslint-disable-next-line no-restricted-globals
      setImmediate: partialPonyfill?.setImmediate || setImmediate.bind(globalThis),
      // eslint-disable-next-line no-restricted-globals
      setInterval: partialPonyfill?.setInterval || setInterval.bind(globalThis),
      // eslint-disable-next-line no-restricted-globals
      setTimeout: partialPonyfill?.setTimeout || setTimeout.bind(globalThis)
    }),
    [partialPonyfill]
  );

  const contextValue = useMemo<Exclude<ContextOf<typeof PonyfillContext>, undefined>>(
    () => ({ ponyfillState: Object.freeze([ponyfill]) as readonly [GlobalScopePonyfill] }),
    [ponyfill]
  );

  return <PonyfillContext.Provider value={contextValue}>{children}</PonyfillContext.Provider>;
};

PonyfillComposer.defaultProps = {
  ponyfill: undefined
};

PonyfillComposer.propTypes = {
  ponyfill: PropTypes.any
};

export default PonyfillComposer;
