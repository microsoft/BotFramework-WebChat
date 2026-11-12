import { createAdapters, type DirectLineSpeechCredentials } from 'botframework-directlinespeech-sdk';
import { expectAssignable } from 'tsd';

type CreateAdaptersInit = Parameters<typeof createAdapters>[0];

const credentials: DirectLineSpeechCredentials = { authorizationToken: '...', region: 'westus2' };

// `fetchCredentials` can be the credentials, a promise of them, or a function returning either.
expectAssignable<CreateAdaptersInit>({ fetchCredentials: credentials });
expectAssignable<CreateAdaptersInit>({ fetchCredentials: Promise.resolve(credentials) });
expectAssignable<CreateAdaptersInit>({ fetchCredentials: () => credentials });
expectAssignable<CreateAdaptersInit>({ fetchCredentials: async () => credentials });
