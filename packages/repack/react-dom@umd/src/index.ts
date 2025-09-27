// @ts-expect-error
const { ReactDOM } = globalThis;

if (typeof ReactDOM === 'undefined') {
  throw new Error('React DOM (UMD) must be loaded before this shim');
}

console.warn('🚨 React DOM UMD-to-ESM shim is for development only.');

export const {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  createPortal,
  findDOMNode,
  flushSync,
  hydrate,
  render,
  unmountComponentAtNode,
  unstable_batchedUpdates,
  unstable_createPortal,
  unstable_createRoot,
  unstable_flushControlled,
  unstable_interactiveUpdates,
  unstable_renderSubtreeIntoContainer,
  version
} = ReactDOM;

export default ReactDOM;
