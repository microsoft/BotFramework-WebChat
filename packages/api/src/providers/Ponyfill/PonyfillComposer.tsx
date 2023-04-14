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
    // The complexity is introduced by the check of ponyfill.
    // eslint-disable-next-line complexity
    () => {
      // IE Mode does not have `globalThis`.
      const globalThisOrWindow = typeof globalThis === 'undefined' ? window : globalThis;

      return {
        cancelAnimationFrame:
          partialPonyfill?.cancelAnimationFrame ||
          // Using clock functions from global if not provided.
          // eslint-disable-next-line no-restricted-globals
          (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame.bind(globalThisOrWindow) : undefined),
        cancelIdleCallback:
          partialPonyfill?.cancelIdleCallback ||
          // eslint-disable-next-line no-restricted-globals
          (typeof cancelIdleCallback === 'function' ? cancelIdleCallback.bind(globalThisOrWindow) : undefined),
        clearImmediate:
          partialPonyfill?.clearImmediate ||
          // eslint-disable-next-line no-restricted-globals
          (typeof clearImmediate === 'function' ? clearImmediate.bind(globalThisOrWindow) : undefined),
        clearInterval:
          partialPonyfill?.clearInterval ||
          // eslint-disable-next-line no-restricted-globals
          (typeof clearInterval === 'function' ? clearInterval.bind(globalThisOrWindow) : undefined),
        clearTimeout:
          partialPonyfill?.clearTimeout ||
          // eslint-disable-next-line no-restricted-globals
          (typeof clearTimeout === 'function' ? clearTimeout.bind(globalThisOrWindow) : undefined),
        // eslint-disable-next-line no-restricted-globals
        Date: partialPonyfill?.Date || Date,
        requestAnimationFrame:
          partialPonyfill?.requestAnimationFrame ||
          // eslint-disable-next-line no-restricted-globals
          (typeof requestAnimationFrame === 'function' ? requestAnimationFrame.bind(globalThisOrWindow) : undefined),
        requestIdleCallback:
          partialPonyfill?.requestIdleCallback ||
          // eslint-disable-next-line no-restricted-globals
          (typeof requestIdleCallback === 'function' ? requestIdleCallback.bind(globalThisOrWindow) : undefined),
        setImmediate:
          partialPonyfill?.setImmediate ||
          // eslint-disable-next-line no-restricted-globals
          (typeof setImmediate === 'function' ? setImmediate.bind(globalThisOrWindow) : undefined),
        setInterval:
          partialPonyfill?.setInterval ||
          // eslint-disable-next-line no-restricted-globals
          (typeof setInterval === 'function' ? setInterval.bind(globalThisOrWindow) : undefined),
        setTimeout:
          partialPonyfill?.setTimeout ||
          // eslint-disable-next-line no-restricted-globals
          (typeof setTimeout === 'function' ? setTimeout.bind(globalThisOrWindow) : undefined)
      };
    },
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
