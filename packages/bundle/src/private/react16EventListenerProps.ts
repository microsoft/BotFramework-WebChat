// Every event prop of React 16, from its event plugins, except the ones that block scrolling (see below).
const REACT_16_EVENT_PROP_NAMES = Object.freeze([
  'onAbort',
  'onAnimationEnd',
  'onAnimationIteration',
  'onAnimationStart',
  'onAuxClick',
  'onBeforeInput',
  'onBlur',
  'onCanPlay',
  'onCanPlayThrough',
  'onCancel',
  'onChange',
  'onClick',
  'onClose',
  'onCompositionEnd',
  'onCompositionStart',
  'onCompositionUpdate',
  'onContextMenu',
  'onCopy',
  'onCut',
  'onDoubleClick',
  'onDrag',
  'onDragEnd',
  'onDragEnter',
  'onDragExit',
  'onDragLeave',
  'onDragOver',
  'onDragStart',
  'onDrop',
  'onDurationChange',
  'onEmptied',
  'onEncrypted',
  'onEnded',
  'onError',
  'onFocus',
  'onGotPointerCapture',
  'onInput',
  'onInvalid',
  'onKeyDown',
  'onKeyPress',
  'onKeyUp',
  'onLoad',
  'onLoadStart',
  'onLoadedData',
  'onLoadedMetadata',
  'onLostPointerCapture',
  'onMouseDown',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseOut',
  'onMouseOver',
  'onMouseUp',
  'onPaste',
  'onPause',
  'onPlay',
  'onPlaying',
  'onPointerCancel',
  'onPointerDown',
  'onPointerEnter',
  'onPointerLeave',
  'onPointerMove',
  'onPointerOut',
  'onPointerOver',
  'onPointerUp',
  'onProgress',
  'onRateChange',
  'onReset',
  'onScroll',
  'onSeeked',
  'onSeeking',
  'onSelect',
  'onStalled',
  'onSubmit',
  'onSuspend',
  'onTimeUpdate',
  'onToggle',
  'onTouchCancel',
  'onTouchEnd',
  // Without `onTouchMove`, `onTouchStart` and `onWheel`: React 16 listens to them as blocking (not passive), which can delay
  // scrolling. Web Chat does not use them.
  'onTransitionEnd',
  'onVolumeChange',
  'onWaiting'
] as const);

function noop() {
  // Only here for React 16 to listen to the event.
}

/**
 * A no-op handler for every event of React 16 that Web Chat may use.
 *
 * React 16 listens to an event on the root of the container when it first renders a handler for it.
 * Rendering these props makes React 16 listen to these events.
 */
const react16EventListenerProps: { readonly [name: string]: () => void } = Object.freeze(
  Object.fromEntries(REACT_16_EVENT_PROP_NAMES.map(name => [name, noop]))
);

export default react16EventListenerProps;
