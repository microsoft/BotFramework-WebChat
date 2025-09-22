import ReactDOM from 'react-dom';

globalThis.ReactDOM = globalThis.ReactDOM || ReactDOM;

export const {
  createPortal,
  findDOMNode,
  flushSync,
  hydrate,
  render,
  unmountComponentAtNode,
  unstable_batchedUpdates,
  unstable_renderSubtreeIntoContainer,
  version
} = globalThis.ReactDOM;

export default globalThis.ReactDOM;
