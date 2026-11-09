declare const process: {
  env: {
    NODE_ENV?: string | undefined;
  };
};

const warned = new Set<string>();

/**
 * Warns once per key, in development only.
 */
function warnOnce(key: string, message: string): void {
  if (process.env.NODE_ENV !== 'production' && !warned.has(key)) {
    warned.add(key);

    console.warn(`botframework-webchat internal: ${message}`);
  }
}

/**
 * Warns once, in development only, that the default providers do not implement an operation yet.
 */
export default function warnPlaceholderOnce(name: string): void {
  warnOnce(name, `"${name}" is not implemented by the default providers yet, it does nothing.`);
}

/**
 * Warns once, in development only, that the default providers are incomplete.
 */
export function warnIncompleteOnce(): void {
  warnOnce(
    '(mount)',
    'The default providers are for tests only: outgoing activities, send box, speech and voice are placeholders.'
  );
}
