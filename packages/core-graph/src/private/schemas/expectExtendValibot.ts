import { expect } from '@jest/globals';
import { assert, type BaseSchema } from 'valibot';

declare module 'expect' {
  interface AsymmetricMatchers {
    valibot(schema: BaseSchema<any, any, any>): any;
  }
}

expect.extend({
  valibot: (actual, schema) => {
    try {
      assert(schema, actual);
    } catch (error) {
      return {
        message: (): string =>
          error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
            ? error.message
            : '',
        pass: false
      };
    }

    return { message: () => '', pass: true };
  }
});
