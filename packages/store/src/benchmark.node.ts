/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */

/**
 * Micro-benchmarks for building blocks of nodes, prints average per operation as a Markdown table.
 *
 * Run by `npm run benchmark:node`. They are used to choose between alternatives, e.g. private field vs. symbol for
 * hidden state on nodes.
 *
 * - Stamp: attaching hidden state to a new plain object
 * - Read: reading hidden state from a stamped object
 * - Freeze: `Object.freeze()` on a plain object with 10 properties
 * - Remove property: `delete` then `Object.freeze()` vs. rebuilding the object without the property
 * - Iterate node set: iterating `FrozenNodeSet` (allocates node references) vs. its IDs via `getNodeSetIds()`
 * - Validate node set: valibot validation of a `Set` of node references, which is skipped for `FrozenNodeSet`
 */
import { parse, set } from 'valibot';
import { nodeReferenceSchema } from './node/NodeReference.ts';
import type { Identifier } from './node/NodeIdentifier.ts';
import FrozenNodeSet, { getNodeSetIds } from './structure/FrozenNodeSet.ts';

const NUM_ITERATIONS = 1_000_000;
const NUM_RUNS = 5;
const NUM_SET_ITEMS = 1_000;

type MicroBenchmark = {
  readonly name: string;
  readonly numOperations: number;

  /** Runs once and returns a value to prevent dead code elimination. */
  run(): unknown;
};

const hiddenSymbol = Symbol('hidden');

class Stamp {
  constructor(target: object) {
    return target;
  }
}

class PrivateFieldStamp extends Stamp {
  constructor(target: object, value: number) {
    super(target);

    this.#value = value;
  }

  readonly #value: number;

  static get(target: object): number | undefined {
    return #value in target ? (target satisfies object as PrivateFieldStamp).#value : undefined;
  }
}

function createPlainObject(index: number): Record<string, unknown> {
  return {
    '@id': `_:m-${index}`,
    '@type': 'Message',
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7,
    hasPart: index
  };
}

const symbolStamped = Array.from({ length: 1_000 }, (_, index) =>
  Object.defineProperty(createPlainObject(index), hiddenSymbol, { value: index })
);

const privateFieldStamped: readonly object[] = Array.from(
  { length: 1_000 },
  (_, index) => new PrivateFieldStamp(createPlainObject(index), index)
);

const nodeSet = new FrozenNodeSet(Array.from({ length: NUM_SET_ITEMS }, (_, index): Identifier => `_:m-${index}`));
const nodeReferenceSetSchema = set(nodeReferenceSchema);

const MICRO_BENCHMARKS: readonly MicroBenchmark[] = Object.freeze([
  {
    name: 'Stamp: symbol',
    numOperations: NUM_ITERATIONS,
    run: () => {
      let last;

      for (let index = 0; index < NUM_ITERATIONS; index++) {
        last = Object.defineProperty(createPlainObject(index), hiddenSymbol, { value: index });
      }

      return last;
    }
  },
  {
    name: 'Stamp: private field',
    numOperations: NUM_ITERATIONS,
    run: () => {
      let last;

      for (let index = 0; index < NUM_ITERATIONS; index++) {
        last = new PrivateFieldStamp(createPlainObject(index), index);
      }

      return last;
    }
  },
  {
    name: 'Read: symbol',
    numOperations: NUM_ITERATIONS,
    run: () => {
      let sum = 0;

      for (let index = 0; index < NUM_ITERATIONS; index++) {
        sum += Reflect.get(symbolStamped[index % 1_000] ?? {}, hiddenSymbol) ?? 0;
      }

      return sum;
    }
  },
  {
    name: 'Read: private field',
    numOperations: NUM_ITERATIONS,
    run: () => {
      let sum = 0;

      for (let index = 0; index < NUM_ITERATIONS; index++) {
        sum += PrivateFieldStamp.get(privateFieldStamped[index % 1_000] ?? {}) ?? 0;
      }

      return sum;
    }
  },
  {
    name: 'Freeze',
    numOperations: NUM_ITERATIONS,
    run: () => {
      let last;

      for (let index = 0; index < NUM_ITERATIONS; index++) {
        last = Object.freeze(createPlainObject(index));
      }

      return last;
    }
  },
  {
    name: 'Remove property: delete',
    numOperations: NUM_ITERATIONS,
    run: () => {
      let last;

      for (let index = 0; index < NUM_ITERATIONS; index++) {
        const object = createPlainObject(index);

        delete object['hasPart'];

        last = Object.freeze(object);
      }

      return last;
    }
  },
  {
    name: 'Remove property: rebuild',
    numOperations: NUM_ITERATIONS,
    run: () => {
      let last;

      for (let index = 0; index < NUM_ITERATIONS; index++) {
        const { hasPart: _, ...object } = createPlainObject(index);

        last = Object.freeze(object);
      }

      return last;
    }
  },
  {
    name: `Iterate node set: values (${NUM_SET_ITEMS} items)`,
    numOperations: 1_000,
    run: () => {
      let length = 0;

      for (let index = 0; index < 1_000; index++) {
        for (const { '@id': id } of nodeSet) {
          length += id.length;
        }
      }

      return length;
    }
  },
  {
    name: `Iterate node set: IDs (${NUM_SET_ITEMS} items)`,
    numOperations: 1_000,
    run: () => {
      let length = 0;

      for (let index = 0; index < 1_000; index++) {
        for (const id of getNodeSetIds(nodeSet) ?? []) {
          length += id.length;
        }
      }

      return length;
    }
  },
  {
    name: `Validate node set (${NUM_SET_ITEMS} items)`,
    numOperations: 1_000,
    run: () => {
      let last;

      for (let index = 0; index < 1_000; index++) {
        last = parse(nodeReferenceSetSchema, nodeSet);
      }

      return last;
    }
  }
]);

function median(values: readonly number[]): number {
  return values.toSorted((x, y) => x - y)[Math.floor(values.length / 2)] ?? NaN;
}

function main(): void {
  const results = MICRO_BENCHMARKS.map(({ name, numOperations, run }) => {
    // Warms up the JIT.
    run();

    const durations = Array.from({ length: NUM_RUNS }, () => {
      const start = performance.now();

      run();

      return performance.now() - start;
    });

    return Object.freeze([name, ((median(durations) / numOperations) * 1_000_000).toFixed(1)] as const);
  });

  const nameWidth = Math.max(...results.map(([name]) => name.length));
  const valueWidth = Math.max(...results.map(([, value]) => value.length), 5);

  console.log(`| ${'Micro-benchmark'.padEnd(nameWidth)} | ${'ns/op'.padStart(valueWidth)} |`);
  console.log(`| ${'-'.repeat(nameWidth)} | ${'-'.repeat(valueWidth - 1)}: |`);

  for (const [name, value] of results) {
    console.log(`| ${name.padEnd(nameWidth)} | ${value.padStart(valueWidth)} |`);
  }
}

main();
