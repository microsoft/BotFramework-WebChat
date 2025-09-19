import '../setup';

import { expectNotAssignable } from 'tsd';

import { createDirectLine } from '../../src/boot/actual/full';

type CreateDirectLineInit = Parameters<typeof createDirectLine>[0];

// Object literal may only specify known properties, and 'invalid' does not exist in type 'Omit<CreateDirectLineOptions, "botAgent">'.

// Equivalent to: createDirectLine({ invalid: true });
expectNotAssignable<CreateDirectLineInit>({ invalid: true });
