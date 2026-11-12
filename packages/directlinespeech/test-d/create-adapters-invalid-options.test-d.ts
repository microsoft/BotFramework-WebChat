import { createAdapters } from 'botframework-directlinespeech-sdk';
import { expectError } from 'tsd';

const fetchCredentials = { authorizationToken: '...', region: 'westus2' };

// Misspelled option.
expectError(createAdapters({ fetchCredentials, speechRecognitionLangauge: 'en-US' }));

// Missing the only required option.
expectError(createAdapters({ speechRecognitionLanguage: 'en-US' }));

// Wrong type: the device ID is a string.
expectError(createAdapters({ audioInputDeviceId: 1, fetchCredentials }));
