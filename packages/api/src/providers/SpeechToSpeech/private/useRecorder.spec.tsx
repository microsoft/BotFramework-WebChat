/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { act, render, waitFor, type RenderResult } from '@testing-library/react';
import React, { type ComponentType } from 'react';
import { useRecorder } from './useRecorder';

// --- Mocks ---

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
  onmessage: null as ((event: { data: any }) => void) | null
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

global.AudioContext = jest.fn(() => mockAudioContext as any);
global.AudioWorkletNode = jest.fn(() => mockWorkletNode as any);
global.Blob = jest.fn(parts => ({ parts, type: parts[1]?.type })) as any;
global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-url');
global.URL.revokeObjectURL = jest.fn();
global.btoa = jest.fn(str => `btoa(${str})`);

// --- Tests ---

describe('useRecorder', () => {
  let onAudioChunk: jest.Mock;
  let HookApp: ComponentType<{ onAudioChunk: (base64: string) => void }>;
  let hookData: ReturnType<typeof useRecorder> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let renderResult: RenderResult;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    onAudioChunk = jest.fn();
    hookData = undefined;
    mockWorkletPort.onmessage = null;
    (mockAudioContext.state as any) = 'running';

    HookApp = ({ onAudioChunk }) => {
      hookData = useRecorder(onAudioChunk);
      return null;
    };
  });

  test('should be initially not recording', () => {
    render(<HookApp onAudioChunk={onAudioChunk} />);
    expect(hookData?.recording).toBe(false);
  });

  test('should start recording when setRecording(true) is called', async () => {
    renderResult = render(<HookApp onAudioChunk={onAudioChunk} />);

    act(() => {
      hookData?.setRecording(true);
    });

    await waitFor(() => expect(hookData?.recording).toBe(true));

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(global.AudioContext).toHaveBeenCalledTimes(1);
    expect(mockAudioContext.audioWorklet.addModule).toHaveBeenCalledTimes(1);
    expect(global.AudioWorkletNode).toHaveBeenCalledWith(expect.anything(), 'audio-recorder');
    expect(mockWorkletNode.connect).toHaveBeenCalledTimes(1);
    expect(mockWorkletPort.postMessage).toHaveBeenCalledWith({ command: 'START' });
  });

  test('should stop recording when setRecording(false) is called', async () => {
    renderResult = render(<HookApp onAudioChunk={onAudioChunk} />);

    // Start recording
    act(() => {
      hookData?.setRecording(true);
    });

    await waitFor(() => expect(hookData?.recording).toBe(true));

    // Stop recording
    act(() => {
      hookData?.setRecording(false);
    });

    await waitFor(() => expect(hookData?.recording).toBe(false));

    expect(mockWorkletPort.postMessage).toHaveBeenCalledWith({ command: 'STOP' });
    expect(mockWorkletNode.disconnect).toHaveBeenCalledTimes(1);
    expect(mockTrack.stop).toHaveBeenCalledTimes(1);
  });

  test('should process audio chunks sent from the worklet', async () => {
    render(<HookApp onAudioChunk={onAudioChunk} />);

    act(() => {
      hookData?.setRecording(true);
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
  });

  test('should handle suspended audio context by resuming it', async () => {
    (mockAudioContext.state as any) = 'suspended';
    render(<HookApp onAudioChunk={onAudioChunk} />);

    act(() => {
      hookData?.setRecording(true);
    });

    await waitFor(() => expect(mockAudioContext.resume).toHaveBeenCalledTimes(1));
  });
});
