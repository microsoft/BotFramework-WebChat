/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import ReactDOM from 'react-dom';

import createWebChatElementClass from './createWebChatElementClass';

// Each test sets the React DOM it emulates.
jest.mock('react-dom', () => ({ __esModule: true, default: {} }));

const ReactWebChat = () => null;

let numDefined = 0;

function createElement(init?: Parameters<typeof createWebChatElementClass>[1]) {
  const name = `webchat-element-${++numDefined}`;

  customElements.define(name, createWebChatElementClass(ReactWebChat, init));

  return document.createElement(name) as ReturnType<typeof document.createElement> & {
    props: object | undefined;
  };
}

function createRootMock() {
  return { render: jest.fn(), unmount: jest.fn() };
}

beforeEach(() => {
  for (const key of Object.keys(ReactDOM)) {
    Reflect.deleteProperty(ReactDOM, key);
  }
});

afterEach(() => document.body.replaceChildren());

test('createRoot passed should be used over React DOM', () => {
  const root = createRootMock();
  const createRoot = jest.fn(() => root);
  const reactDOMCreateRoot = jest.fn();

  Object.assign(ReactDOM, { createRoot: reactDOMCreateRoot, render: jest.fn() });

  const element = createElement({ createRoot });

  document.body.append(element);
  element.props = {};

  expect(createRoot.mock.calls).toEqual([[element.shadowRoot]]);
  expect(root.render).toHaveBeenCalledTimes(1);
  expect(reactDOMCreateRoot).not.toHaveBeenCalled();
});

test('createRoot() of React DOM 18 should be used when createRoot is not passed', () => {
  const root = createRootMock();
  const createRoot = jest.fn(() => root);
  const render = jest.fn();

  Object.assign(ReactDOM, { createRoot, render });

  const element = createElement();

  document.body.append(element);
  element.props = {};

  expect(createRoot.mock.calls).toEqual([[element.shadowRoot]]);
  expect(root.render).toHaveBeenCalledTimes(1);
  expect(render).not.toHaveBeenCalled();
});

test('ReactDOM.render() of React DOM 16 and 17 should render into the shadow root itself', async () => {
  const render = jest.fn();
  const unmountComponentAtNode = jest.fn();

  Object.assign(ReactDOM, { render, unmountComponentAtNode });

  const element = createElement();

  document.body.append(element);
  element.props = {};

  expect(render).toHaveBeenCalledTimes(1);
  expect(render.mock.calls[0][1]).toBe(element.shadowRoot);

  element.remove();

  // Unmount is queued as a microtask.
  await Promise.resolve();

  expect(unmountComponentAtNode.mock.calls).toEqual([[element.shadowRoot]]);
});

test('React DOM 19 without createRoot passed should throw', () => {
  expect(() => createWebChatElementClass(ReactWebChat)).toThrow(
    'createWebChatElementClass() on React 19 or later needs createRoot() of "react-dom/client"'
  );
});

test('Root should be unmounted on disconnect, but not when moved', async () => {
  const root = createRootMock();
  const element = createElement({ createRoot: () => root });

  document.body.append(element);
  element.props = {};

  // Moved: disconnected and connected again synchronously.
  document.body.append(element);

  await Promise.resolve();

  expect(root.unmount).not.toHaveBeenCalled();

  element.remove();

  await Promise.resolve();

  expect(root.unmount).toHaveBeenCalledTimes(1);
});

test('Props set before connected should not render until connected', () => {
  const root = createRootMock();
  const element = createElement({ createRoot: () => root });

  element.props = {};

  expect(root.render).not.toHaveBeenCalled();

  document.body.append(element);

  expect(root.render).toHaveBeenCalledTimes(1);
});
