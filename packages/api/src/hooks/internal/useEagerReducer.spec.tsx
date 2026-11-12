/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { act, render } from '@testing-library/react';
import React, { StrictMode, useCallback, useLayoutEffect, useReducer, useRef } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import useEagerReducer from './useEagerReducer';

type Action = { readonly type: 'APPEND'; readonly text: string } | { readonly type: 'NOTHING' };

function createReducer() {
  const calls: Action[] = [];
  const reducer = (state: string, action: Action): string => {
    calls.push(action);

    return action.type === 'APPEND' ? state + action.text : state;
  };

  return { calls, reducer };
}

test('getState() right after dispatch() returns the new state, before React renders it', () => {
  const { reducer } = createReducer();
  const submitted: string[] = [];
  let handleClick: () => void;

  function SendBox() {
    const [, dispatch, getState] = useEagerReducer(reducer, '');

    // As `Dictation.js`: sets the send box, then submits it in the same handler.
    handleClick = () => {
      dispatch({ text: 'hello', type: 'APPEND' });
      submitted.push(getState());
    };

    return null;
  }

  render(<SendBox />);
  act(() => handleClick());

  expect(submitted).toEqual(['hello']);
});

test('useReducer() with a ref written during render reads the previous state there (why this hook exists)', () => {
  const { reducer } = createReducer();
  const submitted: string[] = [];
  let handleClick: () => void;

  function SendBox() {
    const [state, dispatch] = useReducer(reducer, '');
    const stateRef = useRef(state);

    stateRef.current = state;

    handleClick = () => {
      dispatch({ text: 'hello', type: 'APPEND' });
      submitted.push(stateRef.current);
    };

    return null;
  }

  render(<SendBox />);
  act(() => handleClick());

  expect(submitted).toEqual(['']);
});

test('under Strict Mode, the reducer is called once per action and the state renders', () => {
  const { calls, reducer } = createReducer();
  const rendered: string[] = [];
  let dispatch: (action: Action) => void;

  function Reader() {
    const [state, nextDispatch] = useEagerReducer(reducer, '');

    dispatch = nextDispatch;
    rendered.push(state);

    return null;
  }

  render(
    <StrictMode>
      <Reader />
    </StrictMode>
  );

  act(() => dispatch({ text: 'a', type: 'APPEND' }));
  act(() => dispatch({ text: 'b', type: 'APPEND' }));

  expect(calls).toEqual([
    { text: 'a', type: 'APPEND' },
    { text: 'b', type: 'APPEND' }
  ]);
  expect(rendered[rendered.length - 1]).toBe('ab');
});

test('under Strict Mode, useReducer() calls the reducer more than once per action (why this hook exists)', () => {
  const { calls, reducer } = createReducer();
  let dispatch: (action: Action) => void;

  function Reader() {
    [, dispatch] = useReducer(reducer, '');

    return null;
  }

  render(
    <StrictMode>
      <Reader />
    </StrictMode>
  );

  act(() => dispatch({ text: 'a', type: 'APPEND' }));
  act(() => dispatch({ text: 'b', type: 'APPEND' }));

  expect(calls.length).toBeGreaterThan(2);
});

test('an action that returns the same state does not re-render', () => {
  const { calls, reducer } = createReducer();
  let numRenders = 0;
  let dispatch: (action: Action) => void;

  function Reader() {
    [, dispatch] = useEagerReducer(reducer, 'a');
    numRenders++;

    return null;
  }

  render(<Reader />);
  act(() => dispatch({ text: 'a', type: 'APPEND' }));
  // After an update, React cannot always tell early that a state is the same: it would call the component again.
  act(() => dispatch({ type: 'NOTHING' }));
  act(() => dispatch({ type: 'NOTHING' }));

  expect(calls).toEqual([{ text: 'a', type: 'APPEND' }, { type: 'NOTHING' }, { type: 'NOTHING' }]);
  expect(numRenders).toBe(2);
});

test('two actions in one batch render once, with the state of both', () => {
  const { reducer } = createReducer();
  const rendered: string[] = [];
  let dispatch: (action: Action) => void;

  function Reader() {
    const [state, nextDispatch] = useEagerReducer(reducer, '');

    dispatch = nextDispatch;
    rendered.push(state);

    return null;
  }

  render(<Reader />);

  // Outside of act(), which would batch by itself: as an action of the machines, from a timer.
  unstable_batchedUpdates(() => {
    dispatch({ text: 'a', type: 'APPEND' });
    dispatch({ text: 'b', type: 'APPEND' });
  });

  expect(rendered).toEqual(['', 'ab']);
});

test('dispatch(), getState() and the returned array keep their identity until the state changes', () => {
  const { reducer } = createReducer();
  const results: (readonly [string, (action: Action) => void, () => string])[] = [];
  let rerender: () => void;

  function Reader() {
    const result = useEagerReducer(reducer, '');
    const [, forceRender] = useReducer((count: number) => count + 1, 0);

    rerender = useCallback(() => forceRender(), []);
    results.push(result);

    return null;
  }

  render(<Reader />);
  act(() => rerender());
  act(() => results[0][1]({ text: 'a', type: 'APPEND' }));

  expect(results).toHaveLength(3);
  expect(results[1]).toBe(results[0]);
  expect(results[2]).not.toBe(results[0]);
  expect(results[2][0]).toBe('a');
  expect(results[2][1]).toBe(results[0][1]);
  expect(results[2][2]).toBe(results[0][2]);
  expect(Object.isFrozen(results[2])).toBe(true);
});

test('a dispatch before the subscription (a child effect on mount) renders', () => {
  const { reducer } = createReducer();
  const rendered: string[] = [];

  function Child({ dispatch }: { readonly dispatch: (action: Action) => void }) {
    // Children's effects run before the effects of their parent, which subscribe.
    useLayoutEffect(() => dispatch({ text: 'early', type: 'APPEND' }), [dispatch]);

    return null;
  }

  function Reader() {
    const [state, dispatch] = useEagerReducer(reducer, '');

    rendered.push(state);

    return <Child dispatch={dispatch} />;
  }

  render(<Reader />);

  expect(rendered.at(-1)).toBe('early');
});

test('after unmount, dispatch() still reduces for getState(), without setting the state', () => {
  const { reducer } = createReducer();
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  let dispatch: (action: Action) => void;
  let getState: () => string;

  function Reader() {
    [, dispatch, getState] = useEagerReducer(reducer, '');

    return null;
  }

  try {
    render(<Reader />).unmount();

    // As a machine finishing its work in the microtask after the providers unmounted.
    dispatch({ text: 'late', type: 'APPEND' });

    expect(getState()).toBe('late');
    // React 16 and 17 warn about setting the state of an unmounted component.
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});
