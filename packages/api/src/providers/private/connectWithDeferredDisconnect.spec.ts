/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import connectWithDeferredDisconnect from './connectWithDeferredDisconnect';

function createOwner(name: string, log: string[]) {
  return {
    connect: (directLine: string, userID = 'u') => log.push(`${name}.connect(${directLine}, ${userID})`),
    disconnect: () => log.push(`${name}.disconnect()`),
    release: () => log.push(`${name}.release()`)
  };
}

function mount(owner: ReturnType<typeof createOwner>, directLine: string, userID = 'u') {
  return connectWithDeferredDisconnect({
    connect: () => owner.connect(directLine, userID),
    directLine,
    disconnect: owner.disconnect,
    owner,
    release: owner.release,
    userID,
    username: 'User'
  });
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

test('Strict Mode: unmounting and mounting again with the same owner and connection keeps the connection', async () => {
  const log: string[] = [];
  const owner = createOwner('a', log);

  const cleanup = mount(owner, 'dl1');

  cleanup();
  mount(owner, 'dl1');

  await flushMicrotasks();

  expect(log).toEqual(['a.connect(dl1, u)']);
});

test('unmounting disconnects, then releases, in a microtask', async () => {
  const log: string[] = [];
  const owner = createOwner('a', log);

  mount(owner, 'dl1')();

  expect(log).toEqual(['a.connect(dl1, u)']);

  await flushMicrotasks();

  expect(log).toEqual(['a.connect(dl1, u)', 'a.disconnect()', 'a.release()']);
});

test('another Direct Line or user, same owner: disconnects first, without releasing the owner', async () => {
  const log: string[] = [];
  const owner = createOwner('a', log);

  mount(owner, 'dl1')();
  mount(owner, 'dl2')();
  mount(owner, 'dl2', 'u2');

  await flushMicrotasks();

  expect(log).toEqual([
    'a.connect(dl1, u)',
    'a.disconnect()',
    'a.connect(dl2, u)',
    'a.disconnect()',
    'a.connect(dl2, u2)'
  ]);
});

test('another owner (a store swap, or another provider set), same Direct Line: the other disconnects and is released first', async () => {
  const log: string[] = [];
  const a = createOwner('a', log);
  const b = createOwner('b', log);

  mount(a, 'dl1')();
  mount(b, 'dl1');

  await flushMicrotasks();

  expect(log).toEqual(['a.connect(dl1, u)', 'a.disconnect()', 'a.release()', 'b.connect(dl1, u)']);
});

test('another owner and another Direct Line: unrelated, the microtask disconnects and releases', async () => {
  const log: string[] = [];
  const a = createOwner('a', log);
  const b = createOwner('b', log);

  mount(a, 'dl1')();
  mount(b, 'dl2');

  await flushMicrotasks();

  expect(log).toEqual(['a.connect(dl1, u)', 'b.connect(dl2, u)', 'a.disconnect()', 'a.release()']);
});
