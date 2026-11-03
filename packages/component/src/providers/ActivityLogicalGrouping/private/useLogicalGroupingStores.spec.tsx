/** @jest-environment @happy-dom/jest-environment */

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import ActivityLogicalGroupingComposer from '../ActivityLogicalGroupingComposer';
import useLogicalGroupingStores from './useLogicalGroupingStores';

type Stores = ReturnType<typeof useLogicalGroupingStores>;

function Probe({ results }: { readonly results: Stores[] }) {
  results.push(useLogicalGroupingStores());

  return null;
}

scenario(
  'useLogicalGroupingStores',
  bdd => {
    bdd
      .given('an empty container', () => ({ container: document.createElement('div') }))
      .when('a composer with a probe of useLogicalGroupingStores() renders twice', ({ container }) => {
        const results: Stores[] = [];

        // Rendering again re-renders the probe, as it is not memoized.
        for (let index = 0; index < 2; index++) {
          act(() => {
            render(
              <ActivityLogicalGroupingComposer>
                <Probe results={results} />
              </ActivityLogicalGroupingComposer>,
              container
            );
          });
        }

        return results;
      })
      .then('should render twice', (_, results) => expect(results).toHaveLength(2))
      .and('should return only the two stores', (_, [stores]) =>
        expect(Object.keys(stores).sort()).toEqual(['logicalGroupKeyStore', 'logicalGroupingStore'])
      )
      .and('should return a frozen object', (_, [stores]) => expect(Object.isFrozen(stores)).toBe(true))
      .and('should return the same object on every render', (_, [first, second]) => expect(second).toBe(first));
  },
  JestGlobals
);
