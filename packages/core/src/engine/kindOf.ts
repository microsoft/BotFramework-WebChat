// `miniKindOf()` of Redux 5.0.1 (`src/utils/kindOf.ts`, MIT), which Redux does not export: the kind that its error
// messages name, e.g. "Promise", "date", "error" or "Map" rather than "object".

// The kinds named after their constructor.
const CONSTRUCTOR_KINDS: ReadonlySet<string> = new Set(['Map', 'Promise', 'Set', 'Symbol', 'WeakMap', 'WeakSet']);

function isDate(value: any): boolean {
  return (
    // eslint-disable-next-line no-restricted-globals -- a kind check, not a clock
    value instanceof Date ||
    (typeof value.toDateString === 'function' &&
      typeof value.getDate === 'function' &&
      typeof value.setDate === 'function')
  );
}

function isError(value: any): boolean {
  return (
    value instanceof Error ||
    (typeof value.message === 'string' && value.constructor && typeof value.constructor.stackTraceLimit === 'number')
  );
}

export default function kindOf(value: any): string {
  if (value === undefined) {
    return 'undefined';
  } else if (value === null) {
    return 'null';
  }

  const type = typeof value;

  if (type === 'boolean' || type === 'function' || type === 'number' || type === 'string' || type === 'symbol') {
    return type;
  } else if (Array.isArray(value)) {
    return 'array';
  } else if (isDate(value)) {
    return 'date';
  } else if (isError(value)) {
    return 'error';
  }

  const constructorName = typeof value.constructor === 'function' ? value.constructor.name : null;

  return CONSTRUCTOR_KINDS.has(constructorName)
    ? constructorName
    : // "[object RegExp]" → "regexp"
      Object.prototype.toString
        .call(value)
        .replace(/^\[object |\]$|\s/gu, '')
        .toLowerCase();
}
