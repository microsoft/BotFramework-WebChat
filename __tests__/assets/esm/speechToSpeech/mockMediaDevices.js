/* global AudioContext, navigator */

/**
 * Mocks navigator.mediaDevices.getUserMedia for testing speechToSpeech functionality.
 */
export function setupMockMediaDevices() {
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {};
  }

  navigator.mediaDevices.getUserMedia = constraints => {
    const audioContext = new AudioContext({ sampleRate: constraints?.audio?.sampleRate || 24000 });
    const oscillator = audioContext.createOscillator();
    const destination = audioContext.createMediaStreamDestination();

    oscillator.connect(destination);
    oscillator.start();

    const { stream } = destination;

    stream.getTracks().forEach(track => {
      const originalStop = track.stop.bind(track);
      track.stop = () => {
        oscillator.stop();
        audioContext.close();
        originalStop();
      };
    });

    return stream;
  };
}
