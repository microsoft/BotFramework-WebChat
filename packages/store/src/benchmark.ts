/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */

/**
 * Benchmarks the store and prints average per node as a Markdown table, one row per benchmark, one column per number
 * of nodes.
 *
 * Run by `npm run benchmark`. Numbers should stay flat (or grow slowly) across a row as the number of nodes grows, linear
 * growth means something is O(n) per node.
 *
 * To add a benchmark, add an entry to `BENCHMARKS`.
 *
 * - Append: children are upserted in `dateCreated` order, one transaction per child
 * - Random: children are upserted in random order, one transaction per child
 * - Adopt: a parent is upserted with `hasPart` of existing children in a single transaction, `isPartOf` of every child
 *   is updated
 * - Pending: a parent is upserted with `hasPart` of children not in the graph yet, then children are upserted in the
 *   same transaction
 * - Delete parent: after append, the parent is deleted, `isPartOf` of every child is updated
 * - Iterate: iterating `getSortedParts()` after append
 * - Append with identifier: same as append, every child has an alternate identifier (`identifier`)
 * - Change identifier: after append with identifier, alternate identifier of every child is changed, one transaction
 *   per child
 * - Query by identifier: after append with identifier, every child is queried by its alternate identifier
 * - Memory: heap used after append, requires `--expose-gc`
 */
import type { Node } from './node/Node.ts';
import Store, { type StoreController } from './Store.ts';

const NUM_NODES = Object.freeze([1_000, 10_000, 50_000, 100_000]);
const NUM_RUNS = 3;
const NUM_WARMUP_NODES = 5_000;
const START_TIME = Date.UTC(2026, 0, 1);

type Order = 'append' | 'random';

type Benchmark = {
  readonly fractionDigits: number;
  readonly name: string;
  /** Multiplier to convert the measured value (e.g. milliseconds) to the unit. */
  readonly scale: number;
  readonly unit: string;

  /** Runs once and returns the measured total, e.g. time in milliseconds, or `undefined` if it cannot be measured. */
  run(numNodes: number): number | undefined;
};

function gc(): void {
  // Only available with `--expose-gc`.
  typeof globalThis.gc === 'function' && globalThis.gc();
}

function createStore(): { readonly controller: StoreController; readonly store: Store } {
  let controller: StoreController | undefined;

  const store = new Store({
    start(nextController) {
      controller = nextController;
    }
  });

  if (!controller) {
    throw new Error('Controller should be set after start');
  }

  controller.edit(transaction =>
    transaction.upsert('_:c-1', () => ({ '@id': '_:c-1', '@type': new Set(['Conversation']) }))
  );

  return Object.freeze({ controller, store });
}

/** Returns indices in order, or shuffled by Fisher-Yates. */
function createIndices(numNodes: number, order: Order): number[] {
  const indices = Array.from({ length: numNodes }, (_, index) => index);

  if (order === 'random') {
    for (let index = numNodes - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));

      [indices[+index], indices[+swapIndex]] = [indices[+swapIndex] ?? 0, indices[+index] ?? 0];
    }
  }

  return indices;
}

/**
 * Upserts children into a store.
 *
 * @returns The store and time spent in milliseconds.
 */
function upsertChildren(
  numNodes: number,
  order: Order,
  withIdentifier: boolean = false
): { readonly controller: StoreController; readonly duration: number; readonly store: Store } {
  const { controller, store } = createStore();
  const indices = createIndices(numNodes, order);
  const start = performance.now();

  for (const index of indices) {
    const id = `_:m-${index}` as const;

    controller.edit(transaction =>
      transaction.upsert(id, () => ({
        '@id': id,
        '@type': new Set(['Message']),
        dateCreated: new Date(START_TIME + index * 1_000).toISOString(),
        isPartOf: new Set([{ '@id': '_:c-1' }]),
        ...(withIdentifier ? { identifier: new Set([`_:client-${index}`] as const) } : {})
      }))
    );
  }

  return Object.freeze({ controller, duration: performance.now() - start, store });
}

function createMessage(index: number, isPartOf?: Node['isPartOf']) {
  const id = `_:m-${index}` as const;

  return {
    '@id': id,
    '@type': new Set(['Message']),
    dateCreated: new Date(START_TIME + index * 1_000).toISOString(),
    ...(isPartOf ? { isPartOf } : {})
  };
}

/** Upserts children without parent, then measures upserting the parent with `hasPart` of all children. */
function adopt(numNodes: number): number {
  const { controller } = createStore();
  const ids = Array.from({ length: numNodes }, (_, index) => `_:m-${index}` as const);

  controller.edit(transaction => ids.forEach((id, index) => transaction.upsert(id, () => createMessage(index))));

  const start = performance.now();

  controller.edit(transaction =>
    transaction.upsert('_:c-1', node => ({
      ...(node ?? { '@id': '_:c-1', '@type': new Set(['Conversation']) }),
      hasPart: new Set(ids.map(id => ({ '@id': id })))
    }))
  );

  return performance.now() - start;
}

/** Measures upserting a parent with `hasPart` of children not in the graph yet, then the children. */
function pending(numNodes: number): number {
  const { controller } = createStore();
  const ids = Array.from({ length: numNodes }, (_, index) => `_:m-${index}` as const);
  const start = performance.now();

  controller.edit(transaction => {
    transaction.upsert('_:c-2', () => ({
      '@id': '_:c-2',
      '@type': new Set(['Conversation']),
      hasPart: new Set(ids.map(id => ({ '@id': id })))
    }));

    ids.forEach((id, index) => transaction.upsert(id, () => createMessage(index)));
  });

  return performance.now() - start;
}

/** Appends children, then measures deleting the parent. */
function deleteParent(numNodes: number): number {
  const { controller } = upsertChildren(numNodes, 'append');
  const start = performance.now();

  controller.edit(transaction => transaction.delete('_:c-1'));

  return performance.now() - start;
}

/** Appends children with alternate identifier, then measures changing the alternate identifier of every child. */
function changeIdentifier(numNodes: number): number {
  const { controller } = upsertChildren(numNodes, 'append', true);
  const start = performance.now();

  for (let index = 0; index < numNodes; index++) {
    controller.edit(transaction =>
      transaction.upsert(`_:m-${index}`, node => ({
        ...node!,
        identifier: new Set([`_:server-${index}`] as const)
      }))
    );
  }

  return performance.now() - start;
}

/** Appends children with alternate identifier, then measures querying every child by its alternate identifier. */
function queryByIdentifier(numNodes: number): number {
  const { store } = upsertChildren(numNodes, 'append', true);
  const start = performance.now();

  for (let index = 0; index < numNodes; index++) {
    if (store.queryByIdentifier(`_:client-${index}`)?.['@id'] !== `_:m-${index}`) {
      throw new Error(`ASSERTION: Should find "_:m-${index}" by "_:client-${index}"`);
    }
  }

  return performance.now() - start;
}

function iterate(store: Store, numNodes: number): number {
  const start = performance.now();
  let numIterated = 0;

  for (const _ of store.getSortedParts('_:c-1', { by: 'dateCreated' })) {
    numIterated++;
  }

  if (numIterated !== numNodes) {
    throw new Error(`ASSERTION: Should iterate ${numNodes} children, but iterated ${numIterated}`);
  }

  return performance.now() - start;
}

function measureMemory(numNodes: number): number | undefined {
  if (typeof globalThis.gc !== 'function') {
    return undefined;
  }

  gc();

  const before = process.memoryUsage().heapUsed;
  const { store } = upsertChildren(numNodes, 'append');

  gc();

  const after = process.memoryUsage().heapUsed;

  // Keeps the store alive until measured.
  store.getSnapshot();

  return after - before;
}

function median(values: readonly number[]): number {
  return values.toSorted((x, y) => x - y)[Math.floor(values.length / 2)] ?? NaN;
}

/** Runs multiple times and returns the median of average per node. */
function measure(numNodes: number, fn: () => number | undefined): number | undefined {
  const values = Array.from({ length: NUM_RUNS }, fn);

  return values.every(value => typeof value === 'number') ? median(values) / numNodes : undefined;
}

/** Formats rows as a Markdown table with aligned columns, all columns except the first are right-aligned. */
function toMarkdownTable(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const widths = header.map((cell, index) => Math.max(cell.length, ...rows.map(row => row[+index]?.length ?? 0), 3));

  const toLine = (cells: readonly string[]): string =>
    `| ${cells.map((cell, index) => (index ? cell.padStart(widths[+index] ?? 0) : cell.padEnd(widths[+index] ?? 0))).join(' | ')} |`;

  return [
    toLine(header),
    `| ${widths.map((width, index) => (index ? `${'-'.repeat(width - 1)}:` : '-'.repeat(width))).join(' | ')} |`,
    ...rows.map(toLine)
  ].join('\n');
}

function formatNumber(value: number | undefined, fractionDigits: number): string {
  return typeof value === 'number'
    ? value.toLocaleString('en-US', { maximumFractionDigits: fractionDigits, minimumFractionDigits: fractionDigits })
    : 'n/a';
}

const BENCHMARKS: readonly Benchmark[] = Object.freeze([
  {
    fractionDigits: 2,
    name: 'Append',
    run: (numNodes: number) => upsertChildren(numNodes, 'append').duration,
    scale: 1_000,
    unit: 'µs/node'
  },
  {
    fractionDigits: 2,
    name: 'Random',
    run: (numNodes: number) => upsertChildren(numNodes, 'random').duration,
    scale: 1_000,
    unit: 'µs/node'
  },
  {
    fractionDigits: 2,
    name: 'Adopt',
    run: adopt,
    scale: 1_000,
    unit: 'µs/node'
  },
  {
    fractionDigits: 2,
    name: 'Pending',
    run: pending,
    scale: 1_000,
    unit: 'µs/node'
  },
  {
    fractionDigits: 2,
    name: 'Delete parent',
    run: deleteParent,
    scale: 1_000,
    unit: 'µs/node'
  },
  {
    fractionDigits: 3,
    name: 'Iterate',
    run: (numNodes: number) => iterate(upsertChildren(numNodes, 'append').store, numNodes),
    scale: 1_000,
    unit: 'µs/node'
  },
  {
    fractionDigits: 2,
    name: 'Append with identifier',
    run: (numNodes: number) => upsertChildren(numNodes, 'append', true).duration,
    scale: 1_000,
    unit: 'µs/node'
  },
  {
    fractionDigits: 2,
    name: 'Change identifier',
    run: changeIdentifier,
    scale: 1_000,
    unit: 'µs/node'
  },
  {
    fractionDigits: 3,
    name: 'Query by identifier',
    run: queryByIdentifier,
    scale: 1_000,
    unit: 'µs/node'
  },
  {
    fractionDigits: 0,
    name: 'Memory',
    run: measureMemory,
    scale: 1,
    unit: 'bytes/node'
  }
]);

function main(): void {
  // Warms up the JIT.
  upsertChildren(NUM_WARMUP_NODES, 'append');
  upsertChildren(NUM_WARMUP_NODES, 'random');

  const rows = BENCHMARKS.map(({ fractionDigits, name, run, scale, unit }) =>
    Object.freeze([
      `${name} (${unit})`,
      ...NUM_NODES.map(numNodes => {
        const value = measure(numNodes, () => run(numNodes));

        return formatNumber(typeof value === 'number' ? value * scale : undefined, fractionDigits);
      })
    ])
  );

  console.log(
    toMarkdownTable(['Benchmark', ...NUM_NODES.map(numNodes => `${numNodes.toLocaleString('en-US')} nodes`)], rows)
  );

  typeof globalThis.gc === 'function' || console.log('\nMemory is not measured, run with `node --expose-gc`.');
}

main();
