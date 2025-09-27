// @ts-expect-error
const { React } = globalThis;

if (typeof React === 'undefined') {
  throw new Error('React (UMD) must be loaded before this shim');
}

console.warn('🚨 React UMD-to-ESM shim is for development only.');

export const {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Children,
  cloneElement,
  Component,
  createContext,
  createElement,
  createFactory,
  createRef,
  forwardRef,
  Fragment,
  isValidElement,
  lazy,
  memo,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  unstable_ConcurrentMode,
  unstable_Profiler,
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  version
} = React;

export default React;
