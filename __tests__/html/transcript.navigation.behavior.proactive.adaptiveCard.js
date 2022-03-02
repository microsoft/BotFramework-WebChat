/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('should retain active descendant and widget focus on new message', () =>
  runHTML('transcript.navigation.behavior.proactive.adaptiveCard'));
