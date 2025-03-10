/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('should throw error', () => expect(() => runHTML('simple.throwError.html')).rejects.toThrow('Artificial'));
