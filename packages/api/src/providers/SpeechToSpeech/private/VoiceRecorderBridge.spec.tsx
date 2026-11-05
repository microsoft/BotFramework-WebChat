/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { render } from '@testing-library/react';
import React from 'react';
import useVoiceRecordingMuted from '../../../hooks/useVoiceRecordingMuted';
import { useRecorder } from './useRecorder';
import { VoiceRecorderBridge } from './VoiceRecorderBridge';

const mockPostVoiceActivity = jest.fn();

jest.mock('../../../hooks/internal/usePostVoiceActivity', () => ({
  __esModule: true,
  default: jest.fn(() => mockPostVoiceActivity)
}));
jest.mock('../../../hooks/useVoiceRecordingMuted', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../../../hooks/useVoiceState', () => ({ __esModule: true, default: jest.fn(() => ['listening']) }));
jest.mock('./useRecorder', () => ({ useRecorder: jest.fn(() => ({ mute: jest.fn(), record: jest.fn() })) }));

describe('VoiceRecorderBridge', () => {
  test('should send silent audio chunks once muted', () => {
    (useVoiceRecordingMuted as jest.Mock).mockReturnValue([false, jest.fn()]);

    const { rerender } = render(<VoiceRecorderBridge />);

    // The recorder keeps the callback it got when recording started.
    const [[handleAudioChunk]] = (useRecorder as jest.Mock).mock.calls;

    handleAudioChunk('AQIDBAU=', '2026-11-03T00:00:00.000Z'); // Bytes 1, 2, 3, 4 and 5.

    (useVoiceRecordingMuted as jest.Mock).mockReturnValue([true, jest.fn()]);
    rerender(<VoiceRecorderBridge />);

    // The worklet may still send audio recorded before it received MUTE.
    handleAudioChunk('AQIDBAU=', '2026-11-03T00:00:00.100Z');

    expect(mockPostVoiceActivity.mock.calls.map(([{ value }]) => value.content)).toEqual([
      'AQIDBAU=',
      'AAAAAAA=' // 5 zero bytes.
    ]);
  });
});
