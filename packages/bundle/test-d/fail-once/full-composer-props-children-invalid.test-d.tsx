import '../setup';

import { expectNotAssignable } from 'tsd';
import { type FullComposerProps } from '../../src/FullComposer';

// Negative test: `directLine` is required in FullComposerProps.
// An empty object should not satisfy FullComposerProps.

expectNotAssignable<FullComposerProps>({});
