const { join, relative } = require('path');
const { MessageChannel, Worker } = require('worker_threads');
const { readdir } = require('fs').promises;

describe('compiling TypeScript files', () => {
  let worker;

  // We are using Worker threads to offload the huge TypeScript package.
  // Otherwise, TypeScript will continue to reserve ~200 MB memory until all tests completed.
  const compile = (...filenames) => {
    const { port1, port2 } = new MessageChannel();

    return new Promise((resolve, reject) => {
      port1.on('message', ({ error, returnValue }) => {
        error ? reject(new Error(error)) : resolve(returnValue);
      });

      worker.postMessage({ args: filenames, port: port2 }, [port2]);
    });
  };

  beforeAll(() => {
    worker = new Worker(join(__dirname, './typescript.worker.js'));
  });

  afterAll(() => {
    worker.terminate();
  });

  describe('in /pass/ folder', () => {
    let results;

    beforeEach(async () => {
      const path = join(__dirname, '__typescript__/pass/');
      const files = await readdir(path);

      results = {};

      await Promise.all(
        files.map(async file => {
          const fullPath = join(path, file);

          results[relative(path, fullPath)] = { errors: await compile(fullPath) };
        })
      );
    });

    test('should pass', () => {
      for (const filename of Object.keys(results)) {
        expect(results).toHaveProperty([filename, 'errors'], []);
        expect(results).toHaveProperty([filename, 'errors', 'length'], 0);
      }
    });
  });

  describe('in /fail-once/ folder', () => {
    let results;

    beforeEach(async () => {
      const path = join(__dirname, '__typescript__/fail-once/');
      const files = await readdir(path);

      results = {};

      await Promise.all(
        files.map(async file => {
          const fullPath = join(path, file);

          results[relative(path, fullPath)] = { errors: await compile(fullPath) };
        })
      );
    });

    test('should fail only once', () => {
      for (const filename of Object.keys(results)) {
        expect(results).toHaveProperty([filename, 'errors', 'length'], 1);
      }
    });
  });
});
