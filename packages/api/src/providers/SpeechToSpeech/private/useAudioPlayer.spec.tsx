/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />
/// <reference types="node" />

import { render, type RenderResult } from '@testing-library/react';
import React, { type ComponentType } from 'react';
import { useAudioPlayer } from './useAudioPlayer';

// Mock setVoiceState function
const mockSetVoiceState = jest.fn();

// Mock useVoiceStateWritable hook - returns [state, setVoiceState] array
jest.mock('../../../hooks/internal/useVoiceStateWritable', () => ({
  __esModule: true,
  default: jest.fn(() => [undefined, mockSetVoiceState])
}));

jest.mock('../../Capabilities/useCapabilities', () => ({
  __esModule: true,
  default: jest.fn((selector: (caps: { voiceConfiguration?: { sampleRate: number } }) => unknown) =>
    selector({ voiceConfiguration: { sampleRate: 24000 } })
  )
}));

// Mock AudioContext and related APIs
const mockAudioContext = {
  close: jest.fn().mockResolvedValue(undefined),
  createBuffer: jest.fn(),
  createBufferSource: jest.fn(),
  currentTime: 0,
  destination: {},
  resume: jest.fn().mockResolvedValue(undefined),
  sampleRate: 24000,
  state: 'running'
};

const mockAudioBuffer = {
  duration: 0.1, // 100ms
  getChannelData: jest.fn().mockReturnValue(new Float32Array(2400))
};

// Factory to create unique buffer source mocks
const createMockBufferSource = () => ({
  buffer: null as typeof mockAudioBuffer | null,
  connect: jest.fn(),
  disconnect: jest.fn(),
  onended: null as (() => void) | null,
  start: jest.fn(),
  stop: jest.fn()
});

// Track all created buffer sources for assertions
let createdBufferSources: ReturnType<typeof createMockBufferSource>[] = [];

// Mock global AudioContext
global.AudioContext = jest.fn(() => mockAudioContext) as unknown as typeof AudioContext;
global.atob = jest.fn(str => str); // Simple mock for base64 decode

type UseAudioPlayerReturn = ReturnType<typeof useAudioPlayer>;

describe('useAudioPlayer', () => {
  let HookApp: ComponentType;
  let hookData: UseAudioPlayerReturn | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let renderResult: RenderResult;
  const originalAudioContext = global.AudioContext;

  beforeEach(() => {
    jest.clearAllMocks();
    createdBufferSources = [];
    mockAudioContext.currentTime = 0;
    mockAudioContext.createBuffer.mockReturnValue(mockAudioBuffer);
    mockAudioContext.createBufferSource.mockImplementation(() => {
      const source = createMockBufferSource();
      createdBufferSources.push(source);
      return source;
    });

    HookApp = () => {
      hookData = useAudioPlayer();
      return null;
    };
  });

  afterEach(() => {
    global.AudioContext = originalAudioContext;
  });

  describe('Initialization', () => {
    test('should return queueAudio and stopAllAudio functions', () => {
      render(<HookApp />);

      expect(typeof hookData?.queueAudio).toBe('function');
      expect(typeof hookData?.stopAllAudio).toBe('function');
    });

    test('should create AudioContext on first queueAudio call', async () => {
      render(<HookApp />);

      await hookData?.queueAudio('dGVzdA=='); // base64 for 'test'

      expect(AudioContext).toHaveBeenCalledWith({ sampleRate: 24000 });
    });

    test('should reuse existing AudioContext on subsequent calls', async () => {
      render(<HookApp />);

      await hookData?.queueAudio('dGVzdA==');
      await hookData?.queueAudio('dGVzdDI=');

      expect(AudioContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Audio playback', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should process base64 audio data correctly', async () => {
      await hookData?.queueAudio('dGVzdA==');

      expect(global.atob).toHaveBeenCalledWith('dGVzdA==');
      expect(mockAudioContext.createBuffer).toHaveBeenCalledWith(1, expect.any(Number), 24000);
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });

    test('should set up audio buffer source correctly', async () => {
      await hookData?.queueAudio('dGVzdA==');

      const [source] = createdBufferSources;
      expect(source.connect).toHaveBeenCalledWith(mockAudioContext.destination);
      expect(source.start).toHaveBeenCalled();
      expect(source.buffer).toBe(mockAudioBuffer);
    });

    test('should resume AudioContext if needed', async () => {
      await hookData?.queueAudio('dGVzdA==');

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    test('should queue multiple audio chunks correctly', async () => {
      mockAudioBuffer.duration = 0.1; // 100ms

      await hookData?.queueAudio('dGVzdA==');
      await hookData?.queueAudio('dGVzdDI=');

      expect(createdBufferSources).toHaveLength(2);
      // First chunk starts at currentTime (0), second at 0.1
      expect(createdBufferSources[0].start).toHaveBeenCalledWith(0);
      expect(createdBufferSources[1].start).toHaveBeenCalledWith(0.1);
    });
  });

  describe('Voice state management', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should set voice state to bot_speaking on first chunk', async () => {
      mockAudioContext.currentTime = 0;

      await hookData?.queueAudio('dGVzdA==');

      expect(mockSetVoiceState).toHaveBeenCalledWith('bot_speaking');
    });

    test('should not set bot_speaking on subsequent chunks while playing', async () => {
      mockAudioContext.currentTime = 0;
      mockAudioBuffer.duration = 0.1;

      await hookData?.queueAudio('dGVzdA=='); // First chunk
      mockSetVoiceState.mockClear();

      await hookData?.queueAudio('dGVzdDI='); // Second chunk (while first is still playing)

      expect(mockSetVoiceState).not.toHaveBeenCalledWith('bot_speaking');
    });

    test('should set voice state to listening when last audio ends', async () => {
      await hookData?.queueAudio('dGVzdA==');
      mockSetVoiceState.mockClear();

      // Simulate audio ended
      const [source] = createdBufferSources;
      if (source.onended) {
        source.onended();
      }

      expect(mockSetVoiceState).toHaveBeenCalledWith('listening');
    });

    test('should only trigger listening on the last source ended', async () => {
      mockAudioBuffer.duration = 0.1;

      await hookData?.queueAudio('dGVzdA==');
      await hookData?.queueAudio('dGVzdDI=');
      mockSetVoiceState.mockClear();

      const [firstSource, lastSource] = createdBufferSources;

      // Simulate first chunk ended (should not trigger listening)
      if (firstSource.onended) {
        firstSource.onended();
      }

      expect(mockSetVoiceState).not.toHaveBeenCalledWith('listening');

      // Simulate last chunk ended (should trigger listening)
      if (lastSource.onended) {
        lastSource.onended();
      }

      expect(mockSetVoiceState).toHaveBeenCalledWith('listening');
    });
  });

  describe('Audio cleanup', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should clean up buffer source on ended', async () => {
      await hookData?.queueAudio('dGVzdA==');

      const [source] = createdBufferSources;
      // Simulate audio ended
      if (source.onended) {
        source.onended();
      }

      expect(source.disconnect).toHaveBeenCalled();
      expect(source.buffer).toBeNull();
    });

    test('should stop all audio and close context', async () => {
      await hookData?.queueAudio('dGVzdA==');

      hookData?.stopAllAudio();

      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    test('should clear lastSourceRef onended callback on stop', async () => {
      await hookData?.queueAudio('dGVzdA==');
      const [source] = createdBufferSources;
      const onEndedBefore = source.onended;

      expect(onEndedBefore).not.toBeNull();

      hookData?.stopAllAudio();

      // After stopAllAudio, the onended should be cleared
      expect(source.onended).toBeNull();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should handle invalid base64 data gracefully', async () => {
      await expect(async () => {
        await hookData?.queueAudio('invalid-base64!@#');
      }).not.toThrow();
    });

    test('should handle AudioContext creation failure', async () => {
      global.AudioContext = jest.fn(() => {
        throw new Error('AudioContext not supported');
      }) as unknown as typeof AudioContext;

      await expect(async () => {
        await hookData?.queueAudio('dGVzdA==');
      }).rejects.toThrow('AudioContext not supported');
    });
  });

  describe('Real-world scenarios', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should handle streaming audio chunks', async () => {
      mockAudioBuffer.duration = 0.05; // 50ms chunks

      // Simulate streaming 5 chunks
      await Promise.all(Array.from({ length: 5 }, (_, i) => hookData?.queueAudio(`chunk${i}`)));

      expect(createdBufferSources).toHaveLength(5);
      createdBufferSources.forEach(source => {
        expect(source.start).toHaveBeenCalled();
      });
      // Should only call bot_speaking once (first chunk)
      expect(mockSetVoiceState).toHaveBeenCalledWith('bot_speaking');
      expect(mockSetVoiceState).toHaveBeenCalledTimes(1);
    });

    test('should handle playback interruption', async () => {
      await hookData?.queueAudio('dGVzdA==');

      hookData?.stopAllAudio();

      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    test('should handle resume after stop', async () => {
      // Play, stop, then play again
      await hookData?.queueAudio('dGVzdA==');
      hookData?.stopAllAudio();
      await hookData?.queueAudio('dGVzdDI=');

      expect(AudioContext).toHaveBeenCalledTimes(2); // New context after stop
    });

    test('should reset nextPlayTime after stop allowing immediate playback', async () => {
      mockAudioBuffer.duration = 0.1;

      await hookData?.queueAudio('dGVzdA==');
      hookData?.stopAllAudio();
      mockSetVoiceState.mockClear();

      await hookData?.queueAudio('dGVzdDI=');

      // Should trigger bot_speaking again since it's a fresh start
      expect(mockSetVoiceState).toHaveBeenCalledWith('bot_speaking');
    });
  });

  describe('Performance considerations', () => {
    beforeEach(() => {
      renderResult = render(<HookApp />);
    });

    test('should handle large audio data', async () => {
      const largeBase64 = 'A'.repeat(10000);

      await expect(async () => {
        await hookData?.queueAudio(largeBase64);
      }).not.toThrow();
    });

    test('should handle rapid successive calls', async () => {
      // Ensure the mock "base64" data has an even length as Int16Array requires multiples of 2 bytes
      await Promise.all(Array.from({ length: 100 }, (_, i) => hookData?.queueAudio(`chunk${i}`.padEnd(8, ' '))));

      expect(createdBufferSources).toHaveLength(100);
      createdBufferSources.forEach(source => {
        expect(source.start).toHaveBeenCalled();
      });
    });
  });
});
