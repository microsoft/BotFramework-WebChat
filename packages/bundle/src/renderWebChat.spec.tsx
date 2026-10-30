/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import ReactDOM from 'react-dom';

import renderWebChat from './renderWebChat';

// `render` is set before each test, the React 19 test removes it.
jest.mock('react-dom', () => ({ __esModule: true, default: {} }));

const ReactWebChat = () => null;

let render: jest.Mock;

beforeEach(() => {
  render = jest.fn();

  // React DOM 16.8.6 has no `version`.
  Object.assign(ReactDOM, { createPortal: jest.fn(), render, version: undefined });
});

test('Element should be rendered by ReactDOM.render()', () => {
  const element = document.createElement('div');

  renderWebChat(ReactWebChat, {}, element);

  expect(render).toHaveBeenCalledTimes(1);
  expect(render.mock.calls[0][1]).toBe(element);
});

test('DocumentFragment should be rendered by ReactDOM.render() as a container', () => {
  const fragment = document.createDocumentFragment();

  renderWebChat(ReactWebChat, {}, fragment);

  expect(render).toHaveBeenCalledTimes(1);
  expect(render.mock.calls[0][1]).toBe(fragment);
});

test('Root should be rendered by root.render() instead of ReactDOM.render()', () => {
  const root = { render: jest.fn() };

  renderWebChat(ReactWebChat, {}, root);

  expect(root.render).toHaveBeenCalledTimes(1);
  expect(render).not.toHaveBeenCalled();
});

test('Error from root.render() should be thrown synchronously to the host', () => {
  // React throws this when rendering with a root after `root.unmount()`.
  const root = {
    render: jest.fn(() => {
      throw new Error('Cannot update an unmounted root.');
    })
  };

  expect(() => renderWebChat(ReactWebChat, {}, root)).toThrow('Cannot update an unmounted root.');
  expect(root.render).toHaveBeenCalledTimes(1);
});

test('Element on React 19 should throw an error asking for a root', () => {
  // React 19 removed `ReactDOM.render()`.
  Object.assign(ReactDOM, { render: undefined });

  expect(() => renderWebChat(ReactWebChat, {}, document.createElement('div'))).toThrow(
    'renderWebChat() on React 19 or later needs a root: pass createRoot(element) from "react-dom/client" instead of the element.'
  );
});

test('Neither a container nor a root should throw', () =>
  expect(() => renderWebChat(ReactWebChat, {}, {} as unknown as HTMLElement)).toThrow(
    'renderWebChat() expects an HTMLElement or a root from ReactDOM.createRoot().'
  ));

describe('Element in a shadow root', () => {
  let element: HTMLElement;
  let shadowRoot: ShadowRoot;

  beforeEach(() => {
    element = document.createElement('div');
    shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });

    shadowRoot.append(element);
  });

  test('on React 16 should throw an error suggesting the shadow root or React 17', () => {
    expect(() => renderWebChat(ReactWebChat, {}, element)).toThrow(
      'renderWebChat() on React 16 does not support an element inside a shadow root, React 16 would ignore clicks and typing. Pass the shadow root itself instead of the element, or use React 17 or later (with webchat.js, set window.React and window.ReactDOM before loading it).'
    );
    expect(render).not.toHaveBeenCalled();
  });

  test('on React 16.14 should throw', () => {
    Object.assign(ReactDOM, { version: '16.14.0' });

    expect(() => renderWebChat(ReactWebChat, {}, element)).toThrow('on React 16 does not support');
    expect(render).not.toHaveBeenCalled();
  });

  test('on React 17 or later should be rendered by ReactDOM.render()', () => {
    Object.assign(ReactDOM, { version: '17.0.2' });

    renderWebChat(ReactWebChat, {}, element);

    expect(render).toHaveBeenCalledTimes(1);
    expect(render.mock.calls[0][1]).toBe(element);
  });

  test('passed as the shadow root itself on React 16 should be rendered by ReactDOM.render()', () => {
    renderWebChat(ReactWebChat, {}, shadowRoot);

    expect(render).toHaveBeenCalledTimes(1);
    expect(render.mock.calls[0][1]).toBe(shadowRoot);
  });
});

test('Element outside of a shadow root on React 16 should be rendered by ReactDOM.render()', () => {
  const element = document.createElement('div');

  document.body.append(element);
  renderWebChat(ReactWebChat, {}, element);
  element.remove();

  expect(render).toHaveBeenCalledTimes(1);
  expect(render.mock.calls[0][1]).toBe(element);
});
