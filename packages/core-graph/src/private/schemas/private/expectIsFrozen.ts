import { expect } from '@jest/globals';

declare module 'expect' {
  interface AsymmetricMatchers {
    isFrozen(): any;
  }
}

expect.extend({
  isFrozen: actual =>
    Object.isFrozen(actual)
      ? { message: () => '', pass: true }
      : {
          message: () => 'object is not frozen',
          pass: false
        }
});
