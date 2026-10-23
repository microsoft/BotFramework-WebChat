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
  Object.assign(ReactDOM, { render });
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

test('Element on React 19 should throw an error asking for a root', () => {
  // React 19 removed `ReactDOM.render()`.
  Object.assign(ReactDOM, { render: undefined });

  expect(() => renderWebChat(ReactWebChat, {}, document.createElement('div'))).toThrow(
    'renderWebChat() on React 19 or later needs a root: pass createRoot(element) from "react-dom/client" instead of the element.'
  );
});

test('Neither a container nor a root should throw', () =>
  expect(() => renderWebChat(ReactWebChat, {}, {} as unknown as HTMLElement)).toThrow(
    'renderWebChat() expects an HTMLElement or a root from createRoot().'
  ));
