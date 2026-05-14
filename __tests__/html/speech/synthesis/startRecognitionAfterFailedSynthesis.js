/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('speech/synthesis/startRecognitionAfterFailedSynthesis.html', () =>
  runHTML('speech/synthesis/startRecognitionAfterFailedSynthesis.html'));
