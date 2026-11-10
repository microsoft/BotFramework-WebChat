import { buildInfo } from 'botframework-directlinespeech-sdk';
import { expectError, expectType } from 'tsd';

expectType<string | undefined>(buildInfo.buildTool);
expectType<string | undefined>(buildInfo.moduleFormat);
expectType<string | undefined>(buildInfo.version);

// Read-only.
expectError((buildInfo.version = '1.0.0'));
