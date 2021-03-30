// IMPORTANT: To export anything from this file, add it to index.tsx, which is the .d.ts for this file.

import * as hooks from './hooks';
import Composer from './hooks/Composer';
import concatMiddleware from './hooks/middleware/concatMiddleware';
import defaultStyleOptions from './defaultStyleOptions';
import Localize, { localize } from './localization/Localize';
import normalizeStyleOptions from './normalizeStyleOptions';

export { Composer, concatMiddleware, defaultStyleOptions, hooks, Localize, localize, normalizeStyleOptions };
