import '../setup';

import { expectNotAssignable } from 'tsd';

import { createStyleSet } from '../../src/boot/exports/full';

type CreateStyleSetInit = Parameters<typeof createStyleSet>[0];

// Related to #4081.

// Equivalent to: createStyleSet({ suggestedActionsStackedOverflow: 'string' });
expectNotAssignable<CreateStyleSetInit>({ suggestedActionsStackedOverflow: 'string' });
