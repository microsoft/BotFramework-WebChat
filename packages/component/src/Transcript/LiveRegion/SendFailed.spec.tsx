/** @jest-environment @happy-dom/jest-environment */

import React from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import { hooks } from 'botframework-webchat-api';

import LiveRegionSendFailed from './SendFailed';
import { useLiveRegion } from '../../providers/LiveRegionTwin';

jest.mock('botframework-webchat-api', () => ({
  hooks: {
    useGetActivityByKey: jest.fn(),
    useLocalizer: jest.fn(),
    useSendStatusByActivityKey: jest.fn()
  }
}));
jest.mock('../../providers/LiveRegionTwin', () => ({ useLiveRegion: jest.fn() }));

const mockUseGetActivityByKey = hooks.useGetActivityByKey as jest.Mock;
const mockUseLiveRegion = useLiveRegion as jest.Mock;
const mockUseLocalizer = hooks.useLocalizer as jest.Mock;
const mockUseSendStatusByActivityKey = hooks.useSendStatusByActivityKey as jest.Mock;

describe('LiveRegionSendFailed', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');

    mockUseGetActivityByKey.mockReturnValue(() => ({ channelData: {}, text: 'Hello, World!', type: 'message' }));
    mockUseLocalizer.mockReturnValue(() => 'Failed to send message.');
    mockUseSendStatusByActivityKey.mockReturnValue([new Map([['activity', 'send failed']])]);
  });

  afterEach(() => {
    container.remove();
    jest.clearAllMocks();
  });

  test('renders when the initial send status is failed', () => {
    act(() => {
      render(<LiveRegionSendFailed />, container);
    });

    expect(mockUseLiveRegion.mock.calls[0][0]()).toBe(false);
  });
});
