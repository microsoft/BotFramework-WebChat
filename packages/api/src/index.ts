import * as hooks from './hooks';
import Composer from './hooks/Composer';
import concatMiddleware from './hooks/middleware/concatMiddleware';
import defaultStyleOptions from './defaultStyleOptions';
import Localize, { localize } from './localization/Localize';
import StyleOptions from './StyleOptions';

export { Composer, concatMiddleware, defaultStyleOptions, hooks, Localize, localize };
export type { StyleOptions };
