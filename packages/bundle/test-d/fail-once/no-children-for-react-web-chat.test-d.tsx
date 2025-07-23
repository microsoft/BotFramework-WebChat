import { expectNotAssignable } from 'tsd';

import React, { type ComponentType } from 'react';

import ReactWebChat from '../../src/boot/exports/full';

type PropsOf<T> = T extends ComponentType<infer P> ? P : never;

type Props = PropsOf<typeof ReactWebChat>;

// <ReactWebChat> should not contains any children.

expectNotAssignable<Props>({ children: <div>{'Hello, World'}</div>, directLine: undefined });

// Equivalent to:
// <ReactWebChat directLine={undefined}>
//   <div>Hello, World</div>
// </ReactWebChat>;
