import '../setup';

import { expectNotAssignable } from 'tsd';

import { createDirectLine } from '../../src/exports/full';

// "botAgent" is a forbidden option.
type CreateDirectLineInit = Parameters<typeof createDirectLine>[0];

// Equivalent to: createDirectLine({ botAgent: '123' });
expectNotAssignable<CreateDirectLineInit>({ botAgent: '123' });
