import ReactDOM from 'react-dom';

export const {
  // @ts-expect-error @types/react hid this export.
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  createPortal,
  // @ts-expect-error @types/react hid this export.
  createRoot,
  findDOMNode,
  flushSync,
  hydrate,
  // @ts-expect-error @types/react hid this export.
  hydrateRoot,
  render,
  unmountComponentAtNode,
  unstable_batchedUpdates,
  unstable_renderSubtreeIntoContainer,
  version
} = ReactDOM;

export default ReactDOM;
