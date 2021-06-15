import { createDirectLine } from '../../../../packages/bundle';

// "botAgent" is a forbidden option.
createDirectLine({ botAgent: '123' });
