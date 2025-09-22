import ReactDOM from 'react-dom';

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
} = window.ReactDOM || ReactDOM;

export default window.ReactDOM || ReactDOM;
