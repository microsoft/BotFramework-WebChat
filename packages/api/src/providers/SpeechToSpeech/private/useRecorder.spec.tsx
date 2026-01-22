/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { act, render, waitFor, type RenderResult } from '@testing-library/react';
import React, { type ComponentType } from 'react';
import { useRecorder } from './useRecorder';

jest.mock('../../Ponyfill/usePonyfill', () => ({ __esModule: true, default: jest.fn(() => [{ Date: global.Date }]) }));

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
  postMessage: jest.fn(),
  onmessage: null as ((event: { data: unknown }) => void) | null
};

const mockWorkletNode = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  port: mockWorkletPort
};

const mockAudioContext = {
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn()
  })),
  destination: {},
  audioWorklet: {
    addModule: jest.fn().mockResolvedValue(undefined)
  }
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

  test('should return startRecording and stopRecording functions', () => {
    render(<HookApp onAudioChunk={onAudioChunk} />);
    expect(typeof hookData?.startRecording).toBe('function');
    expect(typeof hookData?.stopRecording).toBe('function');
  });

  test('should start recording when startRecording is called', async () => {
    renderResult = render(<HookApp onAudioChunk={onAudioChunk} />);

    await hookData?.startRecording();

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(global.AudioContext).toHaveBeenCalledTimes(1);
    expect(mockAudioContext.audioWorklet.addModule).toHaveBeenCalledTimes(1);
    expect(global.AudioWorkletNode).toHaveBeenCalledWith(expect.anything(), 'audio-recorder', {
      processorOptions: { bufferSize: 2400 }
    });
    expect(mockWorkletNode.connect).toHaveBeenCalledTimes(1);
    expect(mockWorkletPort.postMessage).toHaveBeenCalledWith({ command: 'START' });
  });

  test('should stop recording when stopRecording is called', async () => {
    renderResult = render(<HookApp onAudioChunk={onAudioChunk} />);

    // Start recording
    await hookData?.startRecording();

    // Stop recording
    act(() => {
      hookData?.stopRecording();
    });

    expect(mockWorkletPort.postMessage).toHaveBeenCalledWith({ command: 'STOP' });
    expect(mockWorkletNode.disconnect).toHaveBeenCalledTimes(1);
    expect(mockTrack.stop).toHaveBeenCalledTimes(1);
  });

  test('should process audio chunks sent from the worklet', async () => {
    render(<HookApp onAudioChunk={onAudioChunk} />);

    await hookData?.startRecording();

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

    await hookData?.startRecording();

    expect(mockAudioContext.resume).toHaveBeenCalledTimes(1);
  });

  test('should reuse existing AudioContext on subsequent calls', async () => {
    render(<HookApp onAudioChunk={onAudioChunk} />);

    await hookData?.startRecording();

    hookData?.stopRecording();

    await hookData?.startRecording();

    // AudioContext should only be created once
    expect(global.AudioContext).toHaveBeenCalledTimes(1);
  });

  test('should request microphone with correct audio constraints', async () => {
    render(<HookApp onAudioChunk={onAudioChunk} />);

    await hookData?.startRecording();

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: {
        channelCount: 1,
        sampleRate: 24000,
        echoCancellation: true
      }
    });
  });
});
