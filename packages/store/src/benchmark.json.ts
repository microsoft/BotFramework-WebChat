/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */
/* eslint-disable no-new-wrappers */
/* eslint-disable no-restricted-globals */

/**
 * Benchmarks `jsonValueSchema` (used by `@value` of JSON literal) against `JSON.parse(JSON.stringify())`, prints
 * average per operation as a Markdown table, one row per payload, one column per converter.
 *
 * Run by `npm run benchmark:json`. `jsonValueSchema` should be faster than "round-trip + reviver", which is the
 * equivalent of `jsonValueSchema` built on top of `JSON.parse(JSON.stringify())`.
 *
 * - `jsonValueSchema`: what JSON literal uses
 * - Round-trip: `JSON.parse(JSON.stringify())`, not equivalent as dangerous keys are kept
 * - Round-trip + reviver: `JSON.parse(JSON.stringify())` with a reviver to remove dangerous keys
 */
import { parse } from 'valibot';
import { jsonValueSchema } from './node/JSONValue.ts';
import isDangerousKey from './private/isDangerousKey.ts';

/** Minimum duration of a run, number of operations per run is calibrated to meet it. */
const MIN_RUN_DURATION = 50;
const NUM_RUNS = 7;

type Converter = {
  readonly name: string;

  convert(value: unknown): unknown;
};

type Payload = {
  readonly name: string;
  readonly value: unknown;
};

function fail(message: string): never {
  throw new Error(message);
}

function roundTripWithReviver(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value), (key: string, value: unknown) => (isDangerousKey(key) ? undefined : value));
}

const CONVERTERS: readonly Converter[] = Object.freeze([
  { name: 'jsonValueSchema', convert: value => parse(jsonValueSchema, value) },
  { name: 'Round-trip', convert: value => JSON.parse(JSON.stringify(value)) },
  { name: 'Round-trip + reviver', convert: roundTripWithReviver }
]);

function createAdaptiveCard(): unknown {
  return {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    actions: [{ data: { id: 1 }, title: 'OK', type: 'Action.Submit' }],
    body: Array.from({ length: 20 }, (_, index) => ({
      items: [
        { size: 'Medium', text: `Item ${index}`, type: 'TextBlock', weight: 'Bolder', wrap: true },
        {
          columns: [
            { items: [{ type: 'Image', url: `https://example.com/${index}.png` }], type: 'Column', width: 'auto' },
            { items: [{ text: 'Lorem ipsum dolor sit amet.', type: 'TextBlock' }], type: 'Column', width: 'stretch' }
          ],
          type: 'ColumnSet'
        }
      ],
      type: 'Container'
    })),
    type: 'AdaptiveCard',
    version: '1.5'
  };
}

function createDeepObject(depth: number): unknown {
  let value: unknown = { leaf: true };

  for (let index = 0; index < depth; index++) {
    value = { child: value, index };
  }

  return value;
}

const PAYLOADS: readonly Payload[] = Object.freeze([
  { name: 'String', value: 'Hello, World!' },
  { name: 'Small object (5 keys)', value: { count: 1, flag: true, nothing: null, tags: ['a', 'b'], text: 'Hello' } },
  { name: 'Adaptive card', value: createAdaptiveCard() },
  {
    name: '5,000 objects',
    value: Array.from({ length: 5_000 }, (_, index) => ({
      active: index % 2 === 0,
      id: index,
      name: `name-${index}`,
      nested: { a: index, b: [index, index + 1, index + 2] },
      score: index * 1.5
    }))
  },
  { name: '100,000 numbers', value: Array.from({ length: 100_000 }, (_, index) => index * 0.5) },
  { name: '1,000 strings of 1 KB', value: Array.from({ length: 1_000 }, (_, index) => `${'x'.repeat(1_000)}${index}`) },
  { name: 'Deep object (500 levels)', value: createDeepObject(500) },
  {
    name: '1,000 objects with Date',
    value: Array.from({ length: 1_000 }, (_, index) => ({ date: new Date(index * 86_400_000), index }))
  },
  {
    name: '1,000 boxed primitives',
    value: Array.from({ length: 1_000 }, (_, index) => [new Number(index), new String(`${index}`), new Boolean(true)])
  }
]);

function median(values: readonly number[]): number {
  return values.toSorted((x, y) => x - y)[Math.floor(values.length / 2)] ?? NaN;
}

/** Runs the converter repeatedly and returns the median duration per operation in microseconds. */
function measure(convert: (value: unknown) => unknown, value: unknown): number {
  let numOperations = 1;

  // Calibrates the number of operations per run, also warms up the JIT.
  for (;;) {
    const start = performance.now();

    for (let index = 0; index < numOperations; index++) {
      convert(value);
    }

    if (performance.now() - start >= MIN_RUN_DURATION) {
      break;
    }

    numOperations *= 2;
  }

  const durations = Array.from({ length: NUM_RUNS }, () => {
    const start = performance.now();

    for (let index = 0; index < numOperations; index++) {
      convert(value);
    }

    return performance.now() - start;
  });

  return (median(durations) / numOperations) * 1_000;
}

function main(): void {
  // Makes sure `jsonValueSchema` is equivalent to "round-trip + reviver" before comparing them.
  for (const { name, value } of PAYLOADS) {
    JSON.stringify(parse(jsonValueSchema, value)) === JSON.stringify(roundTripWithReviver(value)) ||
      fail(`jsonValueSchema returned a different result for "${name}"`);
  }

  const results = PAYLOADS.map(({ name, value }) =>
    Object.freeze([name, ...CONVERTERS.map(({ convert }) => measure(convert, value).toFixed(2))] as const)
  );

  const header = Object.freeze(['Payload (µs/op)', ...CONVERTERS.map(({ name }) => name)]);
  const widths = header.map((title, column) =>
    Math.max(title.length, ...results.map(row => row[+column]?.length ?? 0))
  );

  console.log(`| ${header.map((title, column) => title.padEnd(widths[+column] ?? 0)).join(' | ')} |`);
  console.log(
    `| ${widths.map((width, column) => (column ? `${'-'.repeat(width - 1)}:` : '-'.repeat(width))).join(' | ')} |`
  );

  for (const row of results) {
    console.log(
      `| ${row.map((cell, column) => (column ? cell.padStart(widths[+column] ?? 0) : cell.padEnd(widths[+column] ?? 0))).join(' | ')} |`
    );
  }
}

main();
