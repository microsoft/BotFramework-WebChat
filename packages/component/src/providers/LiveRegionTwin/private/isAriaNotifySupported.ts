import { function_, is, object } from 'valibot';

// `ariaNotify()` is not in the DOM typings of TypeScript yet.
const ariaNotifiableSchema = object({ ariaNotify: function_() });

let ariaNotifySupported: boolean | undefined;

// Support is a property of the browser engine: it cannot change while rendering, and is the same in iframes and popup windows Web Chat may render into.
// Checked on first use rather than on load, because pages and tests may polyfill or remove `ariaNotify()` after Web Chat loads; cached, so the transport is decided on the first render.
export default function isAriaNotifySupported(): boolean {
  return (ariaNotifySupported ??=
    typeof globalThis.Element === 'function' && is(ariaNotifiableSchema, globalThis.Element.prototype));
}

export { ariaNotifiableSchema };
