// Encodes what a parity script recorded as plain JSON, for the golden files: compared with `toStrictEqual`, the encoded
// value of a run equals the parsed golden only if the records are the same. JSON has no `undefined` (a key set to
// `undefined` is not a missing key), no functions and no class instances, so these become marker strings and objects.
// A value of any other type throws: add it here, rather than have it encoded by guesswork.

// The messages of the errors thrown by the JavaScript engine change with its version, so they are replaced by
// "[engine message]". These are the messages of V8 in the goldens. Any other message is kept, including the `TypeError`s
// of Web Chat (e.g. `Cannot modify a readonly Map` of the store): a new message of the engine fails, rather than hide one
// of Web Chat.
const ENGINE_MESSAGES: readonly RegExp[] = Object.freeze([
  /^Cannot read properties of (?:null|undefined) \(reading '[^']*'\)$/u,
  / is not a function$/u
]);

// The messages replaced since the last `takeEngineMessages()`: not compared, but the spec prints them when a golden
// differs.
const engineMessages: string[] = [];

function describeMessage(error: Error): string {
  if (
    Object.getPrototypeOf(error) === TypeError.prototype &&
    ENGINE_MESSAGES.some(pattern => pattern.test(error.message))
  ) {
    engineMessages.push(`${error.name}: ${error.message}`);

    return '[engine message]';
  }

  return error.message;
}

/** An error as text: `TypeError([engine message])`, `Error(message of Web Chat)`. */
function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}(${describeMessage(error)})` : String(error);
}

/** The original messages of the engine errors described since the last call, in order. */
function takeEngineMessages(): readonly string[] {
  return Object.freeze(engineMessages.splice(0));
}

/**
 * Encodes `value` as plain JSON. `labels` names objects by identity (e.g. the Direct Line given to `connect()`) instead
 * of their content.
 */
export default function encodeGolden(value: unknown, labels?: WeakMap<object, string> | undefined): unknown {
  const ancestors = new Set<object>();

  // eslint-disable-next-line complexity
  function walk(item: unknown): unknown {
    if (typeof item === 'undefined') {
      return '[undefined]';
    } else if (typeof item === 'number') {
      return Number.isFinite(item) ? (Object.is(item, -0) ? '[-0]' : item) : `[${item}]`;
    } else if (typeof item === 'function') {
      return '[function]';
    } else if (item === null || typeof item === 'boolean' || typeof item === 'string') {
      return item;
    } else if (typeof item !== 'object') {
      throw new Error(`encodeGolden: cannot encode a ${typeof item}`);
    } else if (labels?.has(item)) {
      return labels.get(item);
    } else if (ancestors.has(item)) {
      throw new Error('encodeGolden: circular reference');
    }

    const prototype = Object.getPrototypeOf(item);

    ancestors.add(item);

    try {
      if (Array.isArray(item)) {
        return Array.from(item, child => walk(child));
      } else if (prototype === Object.prototype || prototype === null) {
        return Object.fromEntries(Object.entries(item).map(([key, child]) => [key, walk(child)]));
      } else if (item instanceof Error) {
        return { [`[${item.name}]`]: describeMessage(item) };
      } else if (typeof File !== 'undefined' && item instanceof File) {
        // Not `lastModified`: the time the file was created, different on every run.
        return { '[File]': { name: item.name, size: item.size, type: item.type } };
      } else if (typeof Blob !== 'undefined' && item instanceof Blob) {
        return { '[Blob]': { size: item.size, type: item.type } };
      }

      throw new Error(`encodeGolden: cannot encode an instance of ${prototype?.constructor?.name || 'a class'}`);
    } finally {
      ancestors.delete(item);
    }
  }

  return walk(value);
}

export { describeError, takeEngineMessages };
