/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('File attachment with blob URL should be downloadable', () => runHTML('attachment.fileContent.blobURL.html'));
