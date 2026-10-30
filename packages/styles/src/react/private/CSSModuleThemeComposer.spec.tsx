/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import CSSModuleThemeComposer from './CSSModuleThemeComposer';
import useStyles from './useStyles';

const styles = Object.freeze({ bubble: 'wA_bubble' });

function Probe({ results }: { readonly results: unknown[] }) {
  results.push(useStyles(styles));

  return null;
}

function renderApp({
  container,
  outerTheme,
  results,
  theme
}: {
  readonly container: HTMLElement;
  readonly outerTheme: { readonly [localName: string]: string };
  readonly results: unknown[];
  readonly theme: { readonly [localName: string]: string };
}) {
  act(() => {
    render(
      <CSSModuleThemeComposer theme={outerTheme}>
        <CSSModuleThemeComposer theme={theme}>
          <Probe results={results} />
        </CSSModuleThemeComposer>
      </CSSModuleThemeComposer>,
      container
    );
  });
}

scenario(
  'CSSModuleThemeComposer',
  bdd => {
    bdd
      .given('an outer composer (e.g. from the host) around an inner composer (e.g. a theme)', () => ({
        container: document.createElement('div'),
        outerTheme: Object.freeze({ bubble: 'wUser_bubble' }),
        results: [],
        theme: Object.freeze({ bubble: 'wTheme_bubble' })
      }))
      .when('rendered', props => renderApp(props))
      .then('the outer classes should be added after the inner ones, not replace them', ({ results }) =>
        expect(results).toStrictEqual([{ bubble: 'bubble wA_bubble wTheme_bubble wUser_bubble' }])
      )
      .when('rendered again with the same theme objects', props => renderApp(props))
      .then('useStyles() should return the same object, the combined theme is memoized', ({ results }) => {
        expect(results).toHaveLength(2);
        expect(results[1]).toBe(results[0]);
      })
      .when('the outer composer gets a new theme', props =>
        renderApp({ ...props, outerTheme: Object.freeze({ bubble: 'wUser2_bubble' }) })
      )
      .then('useStyles() should return the new classes', ({ results }) =>
        expect(results[2]).toStrictEqual({ bubble: 'bubble wA_bubble wTheme_bubble wUser2_bubble' })
      );
  },
  JestGlobals
);
