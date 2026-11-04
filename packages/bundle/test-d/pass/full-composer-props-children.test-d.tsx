import '../setup';

import React from 'react';
import { expectAssignable } from 'tsd';

import { type FullComposerProps } from '../../src/FullComposer';
import { Components } from 'botframework-webchat-component';

// We want to assert that `children` on FullComposerProps accepts:
// 1. React.ReactNode
// 2. AddFullBundleChildren (({ extraStyleSet }: { extraStyleSet: any }) => React.ReactNode)
// and is optional.
// `Composer` renders its children as nodes: the render function `(context) => React.ReactNode` of the API `Composer` is not supported.

// Helper asserting assignability.
const expectProps = <T extends FullComposerProps>(props: T) => expectAssignable<FullComposerProps>(props);

// Minimal required props: we must supply a `directLine` from ComposerProps.
// Using a minimal mock for `directLine` which satisfies DirectLineJSBotConnection shape needed for types only.
const mockDirectLine: any = {
  activity$: { subscribe: () => ({ unsubscribe: () => undefined }) },
  connectionStatus$: { subscribe: () => ({ unsubscribe: () => undefined }) },
  postActivity: () => ({ subscribe: () => ({ unsubscribe: () => undefined }) })
};

// 1. Without children (children optional)
expectProps({ directLine: mockDirectLine });

// 2. With ReactNode child
expectProps({ directLine: mockDirectLine, children: <div /> });

// 3. With AddFullBundleChildren child (takes { extraStyleSet })
const addFullBundleChildren = ({ extraStyleSet }: { extraStyleSet: any }) => <div>{String(!!extraStyleSet)}</div>;
expectProps({ directLine: mockDirectLine, children: addFullBundleChildren });

// Also ensure baseline Composer (from Components) still type checks for overlapping accepted children.
const { Composer } = Components;
const _c1 = <Composer directLine={mockDirectLine} />;
const _c2 = (
  <Composer directLine={mockDirectLine}>
    <div />
  </Composer>
);
