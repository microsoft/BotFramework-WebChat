/* global AudioContext */

/**
 * Mocks AudioContext.createBuffer to return buffers with minimum duration.
 *
 */
export function setupMockAudioPlayback() {
  const originalCreateBuffer = AudioContext.prototype.createBuffer;

  AudioContext.prototype.createBuffer = function (numberOfChannels, length, sampleRate) {
    // Ensure minimum duration of 0.5 seconds for testing
    const minSamples = Math.floor(sampleRate * 0.5);
    const actualLength = Math.max(length, minSamples);

    return originalCreateBuffer.call(this, numberOfChannels, actualLength, sampleRate);
  };

  return {
    restore: () => {
      AudioContext.prototype.createBuffer = originalCreateBuffer;
    }
  };
}
