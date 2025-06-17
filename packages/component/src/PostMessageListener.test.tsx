/**
 * @jest-environment @happy-dom/jest-environment
 */
/* eslint-disable prefer-destructuring */

import React from 'react';
import { render } from '@testing-library/react';

import PostMessageListener from './PostMessageListener';

jest.mock('./hooks/useFocus', () => ({
  __esModule: true,
  default: jest.fn()
}));

const mockFocus = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockFocus.mockClear();
  const useFocusMock = require('./hooks/useFocus').default;
  useFocusMock.mockReturnValue(mockFocus);
});

describe('PostMessageListener', () => {
  let mockAddEventListener: jest.SpyInstance;
  let mockRemoveEventListener: jest.SpyInstance;

  beforeEach(() => {
    mockAddEventListener = jest.spyOn(window, 'addEventListener');
    mockRemoveEventListener = jest.spyOn(window, 'removeEventListener');
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
  });

  afterEach(() => {
    mockAddEventListener.mockRestore();
    mockRemoveEventListener.mockRestore();
  });

  test('should render without crashing', () => {
    const { container } = render(<PostMessageListener />);
    expect(container).toBeTruthy();
  });

  test('should return null', () => {
    const { container } = render(<PostMessageListener />);
    expect(container.firstChild).toBeNull();
  });

  test('should add message event listener on mount', () => {
    render(<PostMessageListener />);

    expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  test('should remove message event listener on unmount', () => {
    const { unmount } = render(<PostMessageListener />);

    const messageListenerCalls = mockAddEventListener.mock.calls.filter(call => call[0] === 'message');
    expect(messageListenerCalls).toHaveLength(1);

    const [, handleMessage] = messageListenerCalls[0];

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('message', handleMessage);
  });

  test('should call focus when receiving WEBCHAT_FOCUS message from parent window', async () => {
    render(<PostMessageListener />);

    const [, handleMessage] = mockAddEventListener.mock.calls.filter(call => call[0] === 'message')[0];

    const mockEvent = {
      source: window.parent,
      data: {
        type: 'WEBCHAT_FOCUS',
        target: 'sendBox'
      }
    };

    await handleMessage(mockEvent);

    expect(mockFocus).toHaveBeenCalledWith('sendBox');
  });

  test('should not call focus when message is not from parent window', async () => {
    render(<PostMessageListener />);

    const [, handleMessage] = mockAddEventListener.mock.calls.filter(call => call[0] === 'message')[0];

    const mockEvent = {
      source: {}, // Different source, not window.parent
      data: {
        type: 'WEBCHAT_FOCUS',
        target: 'sendBox'
      }
    };

    const focusCallCountBefore = mockFocus.mock.calls.length;
    await handleMessage(mockEvent);
    const focusCallCountAfter = mockFocus.mock.calls.length;

    expect(focusCallCountAfter).toBe(focusCallCountBefore);
  });

  test('should not call focus when message type is not WEBCHAT_FOCUS', async () => {
    render(<PostMessageListener />);

    const [, handleMessage] = mockAddEventListener.mock.calls.filter(call => call[0] === 'message')[0];

    const mockEvent = {
      source: window.parent,
      data: {
        type: 'OTHER_MESSAGE',
        target: 'sendBox'
      }
    };

    const focusCallCountBefore = mockFocus.mock.calls.length;
    await handleMessage(mockEvent);
    const focusCallCountAfter = mockFocus.mock.calls.length;

    expect(focusCallCountAfter).toBe(focusCallCountBefore);
  });

  test('should handle message with no data', async () => {
    render(<PostMessageListener />);

    const [, handleMessage] = mockAddEventListener.mock.calls.filter(call => call[0] === 'message')[0];

    const mockEvent = {
      source: window.parent,
      data: null
    };

    const focusCallCountBefore = mockFocus.mock.calls.length;
    await handleMessage(mockEvent);
    const focusCallCountAfter = mockFocus.mock.calls.length;

    expect(focusCallCountAfter).toBe(focusCallCountBefore);
  });

  test('should handle message with undefined data', async () => {
    render(<PostMessageListener />);

    const [, handleMessage] = mockAddEventListener.mock.calls.filter(call => call[0] === 'message')[0];

    const mockEvent = {
      source: window.parent,
      data: undefined
    };

    const focusCallCountBefore = mockFocus.mock.calls.length;
    await handleMessage(mockEvent);
    const focusCallCountAfter = mockFocus.mock.calls.length;

    expect(focusCallCountAfter).toBe(focusCallCountBefore);
  });

  test('should log error when focus throws an error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // Mock implementation
    });
    const focusError = new Error('Focus failed');
    mockFocus.mockRejectedValue(focusError);

    render(<PostMessageListener />);

    const [, handleMessage] = mockAddEventListener.mock.calls.filter(call => call[0] === 'message')[0];

    const mockEvent = {
      source: window.parent,
      data: {
        type: 'WEBCHAT_FOCUS',
        target: 'sendBox'
      }
    };

    await handleMessage(mockEvent);

    expect(consoleErrorSpy).toHaveBeenCalledWith('WebChat focus error:', focusError);

    consoleErrorSpy.mockRestore();
  });

  test('should handle focus without target', async () => {
    render(<PostMessageListener />);

    const [, handleMessage] = mockAddEventListener.mock.calls.filter(call => call[0] === 'message')[0];

    const mockEvent = {
      source: window.parent,
      data: {
        type: 'WEBCHAT_FOCUS'
      }
    };

    await handleMessage(mockEvent);

    expect(mockFocus).toHaveBeenCalledWith(undefined);
  });
});
