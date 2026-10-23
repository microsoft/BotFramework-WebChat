/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import ReactDOM from 'react-dom';

import renderWebChat from './renderWebChat';

jest.mock('react-dom', () => ({ __esModule: true, default: { render: jest.fn() } }));

const ReactWebChat = () => null;

beforeEach(() => jest.mocked(ReactDOM.render).mockClear());

test('DocumentFragment should be rendered by ReactDOM.render() as a container', async () => {
  const fragment = document.createDocumentFragment();

  await renderWebChat(ReactWebChat, {}, fragment as unknown as HTMLElement);

  expect(ReactDOM.render).toHaveBeenCalledTimes(1);
  expect(jest.mocked(ReactDOM.render).mock.calls[0][1]).toBe(fragment);
});

test('Root should be rendered by root.render() instead of ReactDOM.render()', async () => {
  const root = { render: jest.fn() };

  await renderWebChat(ReactWebChat, {}, root);

  expect(root.render).toHaveBeenCalledTimes(1);
  expect(ReactDOM.render).not.toHaveBeenCalled();
});

test('Neither a container nor a root should reject', () =>
  expect(renderWebChat(ReactWebChat, {}, {} as unknown as HTMLElement)).rejects.toThrow(
    'renderWebChat() expects an HTMLElement or a root from createRoot().'
  ));
