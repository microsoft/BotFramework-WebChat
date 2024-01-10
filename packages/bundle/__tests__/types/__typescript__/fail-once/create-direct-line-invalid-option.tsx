import { createDirectLine } from '../../../../lib/index';

// Object literal may only specify known properties, and 'invalid' does not exist in type 'Omit<CreateDirectLineOptions, "botAgent">'.
createDirectLine({ invalid: true });
