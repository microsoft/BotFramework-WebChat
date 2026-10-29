/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import ReactDOM from 'react-dom';

import react16EventListenerProps from './private/react16EventListenerProps';
import renderWebChat from './renderWebChat';

// `render` is set before each test, the React 19 test removes it.
jest.mock('react-dom', () => ({ __esModule: true, default: {} }));

const ReactWebChat = () => null;

let createPortal: jest.Mock;
let render: jest.Mock;

beforeEach(() => {
  createPortal = jest.fn((children, container) => ({ children, container }));
  render = jest.fn();

  // React DOM 16.8.6 has no `version`.
  Object.assign(ReactDOM, { createPortal, render, version: undefined });
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

  test('on React 16 should render a portal into the shadow root with every event handler', () => {
    renderWebChat(ReactWebChat, {}, element);

    expect(createPortal).toHaveBeenCalledTimes(1);
    expect(createPortal.mock.calls[0][0].props).toEqual({ hidden: true, ...react16EventListenerProps });
    expect(createPortal.mock.calls[0][1]).toBe(shadowRoot);
    expect(render.mock.calls[0][0].props.children).toEqual([
      expect.objectContaining({ type: ReactWebChat }),
      createPortal.mock.results[0].value
    ]);
    expect(render.mock.calls[0][1]).toBe(element);
  });

  test('on React 16.14 should render a portal into the shadow root', () => {
    Object.assign(ReactDOM, { version: '16.14.0' });

    renderWebChat(ReactWebChat, {}, element);

    expect(createPortal).toHaveBeenCalledTimes(1);
  });

  test('on React 17 or later should render without a portal', () => {
    Object.assign(ReactDOM, { version: '17.0.2' });

    renderWebChat(ReactWebChat, {}, element);

    expect(createPortal).not.toHaveBeenCalled();
    expect(render.mock.calls[0][0]).toEqual(expect.objectContaining({ type: ReactWebChat }));
  });

  test('rendered into the shadow root itself should render without a portal', () => {
    renderWebChat(ReactWebChat, {}, shadowRoot);

    expect(createPortal).not.toHaveBeenCalled();
    expect(render.mock.calls[0][0]).toEqual(expect.objectContaining({ type: ReactWebChat }));
    expect(render.mock.calls[0][1]).toBe(shadowRoot);
  });
});

test('Element outside of a shadow root on React 16 should render without a portal', () => {
  const element = document.createElement('div');

  document.body.append(element);
  renderWebChat(ReactWebChat, {}, element);
  element.remove();

  expect(createPortal).not.toHaveBeenCalled();
  expect(render.mock.calls[0][0]).toEqual(expect.objectContaining({ type: ReactWebChat }));
});

test('React 16 event handlers should cover every event of React DOM 16.8.6 except the ones that block scrolling', () => {
  const actualReactDOM = jest.requireActual('react-dom');

  // Private API of React DOM 16.8.6: `Events[4]` is the dispatch config of every event, by event name.
  const [, , , , eventNameDispatchConfigs] = actualReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Events;

  // React DOM 16.8.6 has no `version`.
  expect(actualReactDOM).not.toHaveProperty('version');
  expect(Object.keys(react16EventListenerProps).sort()).toEqual(
    Object.values(eventNameDispatchConfigs)
      .map(({ phasedRegistrationNames, registrationName }) => registrationName || phasedRegistrationNames.bubbled)
      .filter(name => !['onTouchMove', 'onTouchStart', 'onWheel'].includes(name))
      .sort()
  );
});
