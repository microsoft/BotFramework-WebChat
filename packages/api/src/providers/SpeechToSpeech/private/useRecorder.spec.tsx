/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { act, render, waitFor, type RenderResult } from '@testing-library/react';
import React, { type ComponentType } from 'react';
import { useRecorder } from './useRecorder';

jest.mock('../../Ponyfill/usePonyfill', () => ({ __esModule: true, default: jest.fn(() => [{ Date: global.Date }]) }));
jest.mock('../../Capabilities/useCapabilities', () => ({
  __esModule: true,
  default: jest.fn((selector: (caps: { voiceConfiguration?: { sampleRate: number } }) => unknown) =>
    selector({ voiceConfiguration: { sampleRate: 24000 } })
  )
}));

const mockTrack = {
  stop: jest.fn()
};

const mockMediaStream = {
  getTracks: jest.fn(() => [mockTrack])
};

const mockMediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue(mockMediaStream)
};

const mockWorkletPort = {
  onmessage: null as ((event: { data: unknown }) => void) | null,
  postMessage: jest.fn()
};

const mockWorkletNode = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  port: mockWorkletPort
};

const mockAudioContext = {
  audioWorklet: {
    addModule: jest.fn().mockResolvedValue(undefined)
  },
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn()
  })),
  destination: {},
  resume: jest.fn().mockResolvedValue(undefined),
  state: 'running'
};

// --- Global Mocks Setup ---

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true
});

global.AudioContext = jest.fn(() => mockAudioContext) as unknown as typeof AudioContext;
global.AudioWorkletNode = jest.fn(() => mockWorkletNode) as unknown as typeof AudioWorkletNode;
global.Blob = jest.fn(parts => ({ parts, type: (parts as { type?: string }[])[1]?.type })) as unknown as typeof Blob;
global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-url');
global.URL.revokeObjectURL = jest.fn();
global.btoa = jest.fn(str => `btoa(${str})`);

// --- Tests ---

describe('useRecorder', () => {
  let onAudioChunk: jest.Mock;
  let HookApp: ComponentType<{ onAudioChunk: (base64: string, timestamp: string) => void }>;
  let hookData: ReturnType<typeof useRecorder> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let renderResult: RenderResult;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    onAudioChunk = jest.fn();
    hookData = undefined;
    mockWorkletPort.onmessage = null;
    (mockAudioContext.state as string) = 'running';

    HookApp = ({ onAudioChunk: onChunk }) => {
      hookData = useRecorder(onChunk);
      return null;
    };
  });

  test('should return record function', () => {
    render(<HookApp onAudioChunk={onAudioChunk} />);
    expect(typeof hookData?.record).toBe('function');
  });

  test('should start recording when record is called', async () => {
    renderResult = render(<HookApp onAudioChunk={onAudioChunk} />);

    act(() => {
      hookData?.record();
    });

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    });

    expect(global.AudioContext).toHaveBeenCalledTimes(1);
    expect(mockAudioContext.audioWorklet.addModule).toHaveBeenCalledTimes(1);
    expect(global.AudioWorkletNode).toHaveBeenCalledWith(expect.anything(), 'audio-recorder', {
      processorOptions: { bufferSize: 2400 }
    });
    expect(mockWorkletNode.connect).toHaveBeenCalledTimes(1);
    expect(mockWorkletPort.postMessage).toHaveBeenCalledWith({ command: 'START' });
  });

  test('should stop recording when returned cleanup function is called', async () => {
    renderResult = render(<HookApp onAudioChunk={onAudioChunk} />);

    let stopRecording: (() => void) | undefined;
    // Start recording
    act(() => {
      stopRecording = hookData?.record();
    });

    // Wait for async startRecording to complete
    await waitFor(() => {
      expect(mockWorkletPort.postMessage).toHaveBeenCalledWith({ command: 'START' });
    });

    // Stop recording
    act(() => {
      stopRecording?.();
    });

    expect(mockWorkletPort.postMessage).toHaveBeenCalledWith({ command: 'STOP' });
    expect(mockWorkletNode.disconnect).toHaveBeenCalledTimes(1);
    expect(mockTrack.stop).toHaveBeenCalledTimes(1);
  });

  test('should process audio chunks sent from the worklet', async () => {
    render(<HookApp onAudioChunk={onAudioChunk} />);

    act(() => {
      hookData?.record();
    });

    await waitFor(() => expect(mockWorkletPort.onmessage).not.toBeNull());

    // Simulate a message from the audio worklet
    const mockAudioData = new Float32Array([0.1, 0.2, -0.1]);
    act(() => {
      mockWorkletPort.onmessage!({
        data: {
          eventType: 'audio',
          audioData: mockAudioData
        }
      });
    });

    await waitFor(() => expect(onAudioChunk).toHaveBeenCalledTimes(1));
    expect(global.btoa).toHaveBeenCalled();
    // Check that timestamp is passed as second argument
    expect(onAudioChunk).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  });

  test('should handle suspended audio context by resuming it', async () => {
    (mockAudioContext.state as string) = 'suspended';
    render(<HookApp onAudioChunk={onAudioChunk} />);

    act(() => {
      hookData?.record();
    });

    await waitFor(() => {
      expect(mockAudioContext.resume).toHaveBeenCalledTimes(1);
    });
  });

  test('should reuse existing AudioContext on subsequent calls', async () => {
    render(<HookApp onAudioChunk={onAudioChunk} />);

    let stopRecording: (() => void) | undefined;
    act(() => {
      stopRecording = hookData?.record();
    });

    await waitFor(() => {
      expect(mockWorkletPort.postMessage).toHaveBeenCalledWith({ command: 'START' });
    });

    act(() => {
      stopRecording?.();
    });

    act(() => {
      hookData?.record();
    });

    await waitFor(() => {
      expect(mockWorkletPort.postMessage).toHaveBeenCalledTimes(3); // START, STOP, START
    });

    // AudioContext should only be created once
    expect(global.AudioContext).toHaveBeenCalledTimes(1);
  });

  test('should request microphone with correct audio constraints', async () => {
    render(<HookApp onAudioChunk={onAudioChunk} />);

    act(() => {
      hookData?.record();
    });

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          sampleRate: 24000
        }
      });
    });
  });
});
