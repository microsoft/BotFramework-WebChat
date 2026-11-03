/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import { webChatPrefixedClassName, type ClassNameTransform } from './classNameTransforms';
import CSSModuleThemeComposer from './CSSModuleThemeComposer';
import useStyles from './useStyles';

// Same shape as a CSS module import: local name → hashed class name.
const styles = Object.freeze({ bubble: 'wA_bubble', 'bubble--from-user': 'wA_bubble--from-user' });

const hashedClassNameOnly: ClassNameTransform = () => undefined;

function Probe({
  results,
  transform
}: {
  readonly results: unknown[];
  readonly transform?: ClassNameTransform | undefined;
}) {
  results.push(useStyles(styles, transform));

  return null;
}

scenario(
  'useStyles',
  bdd => {
    bdd
      .given('no CSSModuleThemeComposer', () => ({ results: [] }))
      .when('useStyles() is called without a transform', ({ results }) => {
        act(() => {
          render(<Probe results={results} />, document.createElement('div'));
        });

        return results[0];
      })
      .then('every local name should map to "<local name> <hashed name>", as before', (_, classNames) =>
        expect(classNames).toStrictEqual({
          bubble: 'bubble wA_bubble',
          'bubble--from-user': 'bubble--from-user wA_bubble--from-user'
        })
      )
      .and('the result should be frozen', (_, classNames) => expect(Object.isFrozen(classNames)).toBe(true));

    bdd
      .given('a CSSModuleThemeComposer with "bubble" and "transcript"', () => ({
        results: [],
        theme: Object.freeze({ bubble: 'wT_bubble', transcript: 'wT_transcript' })
      }))
      .when('useStyles() is called below it', ({ results, theme }) => {
        act(() => {
          render(
            <CSSModuleThemeComposer theme={theme}>
              <Probe results={results} />
            </CSSModuleThemeComposer>,
            document.createElement('div')
          );
        });

        return results[0];
      })
      .then('"bubble" should also have the theme class', (_, classNames) =>
        expect(classNames).toHaveProperty('bubble', 'bubble wA_bubble wT_bubble')
      )
      .and('local names not in the theme should be unchanged', (_, classNames) =>
        expect(classNames).toHaveProperty('bubble--from-user', 'bubble--from-user wA_bubble--from-user')
      )
      .and('"transcript" should not be added, the CSS module does not use it', (_, classNames) =>
        expect(classNames).not.toHaveProperty('transcript')
      );

    bdd
      .given('a CSSModuleThemeComposer with "bubble"', () => ({
        results: [],
        theme: Object.freeze({ bubble: 'wT_bubble' })
      }))
      .when('useStyles() is called with the "webchat__" prefix transform', ({ results, theme }) => {
        act(() => {
          render(
            <CSSModuleThemeComposer theme={theme}>
              <Probe results={results} transform={webChatPrefixedClassName} />
            </CSSModuleThemeComposer>,
            document.createElement('div')
          );
        });

        return results[0];
      })
      .then('the readable class names should be prefixed', (_, classNames) =>
        expect(classNames).toStrictEqual({
          bubble: 'webchat__bubble wA_bubble wT_bubble',
          'bubble--from-user': 'webchat__bubble--from-user wA_bubble--from-user'
        })
      );

    bdd
      .given('no CSSModuleThemeComposer', () => ({ results: [] }))
      .when('useStyles() is called with a transform that returns undefined', ({ results }) => {
        act(() => {
          render(<Probe results={results} transform={hashedClassNameOnly} />, document.createElement('div'));
        });

        return results[0];
      })
      .then('only the hashed class names should be left', (_, classNames) =>
        expect(classNames).toStrictEqual({ bubble: 'wA_bubble', 'bubble--from-user': 'wA_bubble--from-user' })
      );
  },
  JestGlobals
);
