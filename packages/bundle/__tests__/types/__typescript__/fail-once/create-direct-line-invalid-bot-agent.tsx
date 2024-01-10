import { createDirectLine } from '../../../../lib/index';

// "botAgent" is a forbidden option.
createDirectLine({ botAgent: '123' });
