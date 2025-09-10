import '../setup';

import { type ComponentType } from 'react';
import { expectNotAssignable } from 'tsd';

import ReactWebChat from '../../src/boot/exports/full';

type PropsOf<T> = T extends ComponentType<infer P> ? P : never;

type Props = PropsOf<typeof ReactWebChat>;

// "dir" must be a string of "ltr' | 'rtl' | 'auto'.

expectNotAssignable<Props>({ dir: 123, directLine: undefined });
// Equivalent to: <ReactWebChat dir={123} directLine={undefined} />;
