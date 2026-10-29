import { test } from 'node:test';

test('import should work', async () => {
  await import('./index.ts');
});
