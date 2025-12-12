/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />
/// <reference types="node" />

import { render, type RenderResult } from '@testing-library/react';
import React, { type ComponentType } from 'react';
import { useAudioPlayer } from './useAudioPlayer';

// Mock AudioContext and related APIs
const mockAudioContext = {
  sampleRate: 24000,
  currentTime: 0,
  destination: {},
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  createBuffer: jest.fn(),
  createBufferSource: jest.fn()
};

const mockAudioBuffer = {
  duration: 0.1, // 100m
  getChannelData: jest.fn().mockReturnValue(new Float32Array(2400))
};

const mockBufferSource = {
  buffer: null,
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  disconnect: jest.fn(),
  onended: null
};

// Mock global AudioContext
global.AudioContext = jest.fn(() => mockAudioContext) as any;
global.atob = jest.fn(str => str); // Simple mock for base64 decode

type UseAudioPlayerReturn = ReturnType<typeof useAudioPlayer>;

describe('setup', () => {
  let HookApp: ComponentType;
  let hookData: UseAudioPlayerReturn | undefined;
  let renderResult: RenderResult;
  const originalAudioContext = global.AudioContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAudioContext.currentTime = 0;
    mockAudioContext.createBuffer.mockReturnValue(mockAudioBuffer);
    mockAudioContext.createBufferSource.mockReturnValue(mockBufferSource);
    mockBufferSource.buffer = null;
    mockBufferSource.onended = null;

    HookApp = () => {
      hookData = useAudioPlayer();
      return null;
    };
  });

  afterEach(() => {
    global.AudioContext = originalAudioContext;
  });

  describe('Initialization', () => {
    test('should initialize with correct default values', () => {
      render(<HookApp />);

      expect(hookData?.isPlaying).toBe(false);
      expect(typeof hookData?.playAudio).toBe('function');
      expect(typeof hookData?.stopAudio).toBe('function');
    });

    test('should create AudioContext on first playAudio call', () => {
      render(<HookApp />);

      hookData?.playAudio('dGVzdA=='); // base64 for 'test'

      expect(AudioContext).toHaveBeenCalledWith({ sampleRate: 24000 });
    });

    test('should reuse existing AudioContext on subsequent calls', () => {
      render(<HookApp />);

      hookData?.playAudio('dGVzdA==');
      hookData?.playAudio('dGVzdDI=');

      expect(AudioContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Audio playback', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should process base64 audio data correctly', () => {
      hookData?.playAudio('dGVzdA==');

      expect(global.atob).toHaveBeenCalledWith('dGVzdA==');
      expect(mockAudioContext.createBuffer).toHaveBeenCalledWith(1, expect.any(Number), 24000);
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });

    test('should set up audio buffer source correctly', () => {
      hookData?.playAudio('dGVzdA==');

      expect(mockBufferSource.connect).toHaveBeenCalledWith(mockAudioContext.destination);
      expect(mockBufferSource.start).toHaveBeenCalled();
      expect(mockBufferSource.buffer).toBe(mockAudioBuffer);
    });

    test('should resume AudioContext if needed', () => {
      hookData?.playAudio('dGVzdA==');

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    test('should queue multiple audio chunks correctly', () => {
      mockAudioBuffer.duration = 0.1; // 100ms

      hookData?.playAudio('dGVzdA==');
      hookData?.playAudio('dGVzdDI=');

      expect(mockBufferSource.start).toHaveBeenCalledTimes(2);
      // First chunk starts at currentTime (0), second at 0.1
      expect(mockBufferSource.start).toHaveBeenNthCalledWith(1, 0);
      expect(mockBufferSource.start).toHaveBeenNthCalledWith(2, 0.1);
    });
  });

  describe('isPlaying state', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should return true when audio is queued for playback', () => {
      mockAudioContext.currentTime = 0;
      mockAudioBuffer.duration = 0.1;

      hookData?.playAudio('dGVzdA==');
      renderResult.rerender(<HookApp />);

      expect(hookData?.isPlaying).toBe(true);
    });

    test('should return false when no audio is queued', () => {
      expect(hookData?.isPlaying).toBe(false);
    });

    test('should handle multiple chunks and playing state', () => {
      mockAudioContext.currentTime = 0.05; // In the middle of first chunk
      mockAudioBuffer.duration = 0.1;

      hookData?.playAudio('dGVzdA=='); // 0 - 0.1
      hookData?.playAudio('dGVzdDI='); // 0.1 - 0.2
      renderResult.rerender(<HookApp />);

      expect(hookData?.isPlaying).toBe(true);
    });
  });

  describe('Audio cleanup', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should clean up buffer source on ended', () => {
      hookData?.playAudio('dGVzdA==');

      // Simulate audio ended
      if (mockBufferSource.onended) {
        mockBufferSource.onended();
      }

      expect(mockBufferSource.disconnect).toHaveBeenCalled();
      expect(mockBufferSource.buffer).toBeNull();
    });

    test('should stop all audio and close context', () => {
      hookData?.playAudio('dGVzdA==');

      hookData?.stopAudio();
      renderResult.rerender(<HookApp />);

      expect(mockAudioContext.close).toHaveBeenCalled();
      expect(hookData?.isPlaying).toBe(false);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should handle invalid base64 data gracefully', () => {
      expect(() => {
        hookData?.playAudio('invalid-base64!@#');
      }).not.toThrow();
    });

    test('should handle AudioContext creation failure', () => {
      global.AudioContext = jest.fn(() => {
        throw new Error('AudioContext not supported');
      }) as any;

      expect(() => {
        hookData?.playAudio('dGVzdA==');
      }).toThrow('AudioContext not supported');
    });

    test('should handle missing audio context in isPlaying', () => {
      // Before any audio is played, audioCtxRef should be null
      expect(hookData?.isPlaying).toBe(false);
    });
  });

  describe('Real-world scenarios', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should handle streaming audio chunks', () => {
      mockAudioBuffer.duration = 0.05; // 50ms chunks

      // Simulate streaming 5 chunks
      for (let i = 0; i < 5; i++) {
        hookData?.playAudio(`chunk${i}`);
      }

      expect(mockBufferSource.start).toHaveBeenCalledTimes(5);
      renderResult.rerender(<HookApp />);
      expect(hookData?.isPlaying).toBe(true);
    });

    test('should handle playback interruption', () => {
      hookData?.playAudio('dGVzdA==');
      renderResult.rerender(<HookApp />);
      expect(hookData?.isPlaying).toBe(true);

      hookData?.stopAudio();
      renderResult.rerender(<HookApp />);
      expect(hookData?.isPlaying).toBe(false);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    test('should handle resume after stop', () => {
      // Play, stop, then play again
      hookData?.playAudio('dGVzdA==');
      hookData?.stopAudio();
      hookData?.playAudio('dGVzdDI=');

      expect(AudioContext).toHaveBeenCalledTimes(2); // New context after stop
    });
  });

  describe('Performance considerations', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should handle large audio data', () => {
      const largeBase64 = 'A'.repeat(10000);

      expect(() => {
        hookData?.playAudio(largeBase64);
      }).not.toThrow();
    });

    test('should handle rapid successive calls', () => {
      for (let i = 0; i < 100; i++) {
        // Ensure the mock "base64" data has an even length as Int16Array (which represents 16-bit audio samples) requires the underlying data to be in multiples of 2 bytes
        hookData?.playAudio(`chunk${i}`.padEnd(8, ' '));
      }

      expect(mockBufferSource.start).toHaveBeenCalledTimes(100);
    });
  });
});
