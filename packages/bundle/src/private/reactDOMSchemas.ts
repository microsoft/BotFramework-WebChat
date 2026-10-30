import { reactNode } from '@msinternal/botframework-webchat-react-valibot';
import {
  args,
  custom,
  function_,
  is,
  literal,
  object,
  optional,
  picklist,
  pipe,
  startsWith,
  string,
  tuple
} from 'valibot';

/** Containers `ReactDOM.render()` accepts, `null` included as in its typings (it throws at run time). */
type RenderWebChatContainer = Element | Document | DocumentFragment | null;

// Same as `Node.ELEMENT_NODE`, `Node.DOCUMENT_NODE` and `Node.DOCUMENT_FRAGMENT_NODE`, without needing `Node` on import.
const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;

// Containers `ReactDOM.render()` accepts: element, document and document fragment, by `nodeType` to work across realms.
// Checked before `reactRootSchema`: some custom elements (e.g. Lit) have their own `render()` method.
const containerSchema = custom<Exclude<RenderWebChatContainer, null>>(value =>
  is(object({ nodeType: picklist([DOCUMENT_FRAGMENT_NODE, DOCUMENT_NODE, ELEMENT_NODE]) }), value)
);

// `ReactDOM.render(children, container)`, React 18 or earlier.
const legacyReactDOMSchema = object({ render: pipe(function_(), args(tuple([reactNode(), containerSchema]))) });

// `root.render(children)`, root from `createRoot()` of "react-dom/client".
const reactRootSchema = object({ render: pipe(function_(), args(tuple([reactNode()]))) });

// React DOM 16.13 added `version`, earlier versions do not have it.
const react16DOMSchema = object({ createPortal: function_(), version: optional(pipe(string(), startsWith('16.'))) });

// A shadow root, by `nodeType` and `host` to work across realms.
const shadowRootSchema = custom<ShadowRoot>(value =>
  is(object({ host: object({ nodeType: literal(ELEMENT_NODE) }), nodeType: literal(DOCUMENT_FRAGMENT_NODE) }), value)
);

export {
  containerSchema,
  legacyReactDOMSchema,
  react16DOMSchema,
  reactRootSchema,
  shadowRootSchema,
  type RenderWebChatContainer
};
