import ReactDOM from 'react-dom';

export const {
  // @ts-expect-error @types/react hid this export.
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  createPortal,
  findDOMNode,
  hydrate,
  render,
  unmountComponentAtNode,
  unstable_batchedUpdates,
  // @ts-expect-error @types/react hid this export.
  unstable_createPortal,
  // @ts-expect-error @types/react hid this export.
  unstable_createRoot,
  // @ts-expect-error @types/react hid this export.
  unstable_flushControlled,
  // @ts-expect-error @types/react hid this export.
  unstable_interactiveUpdates,
  unstable_renderSubtreeIntoContainer,
  version
} = ReactDOM;

export default ReactDOM;
