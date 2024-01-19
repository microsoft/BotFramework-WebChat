import { createStyleSet } from '../../src/index';

// Related to #4081.
createStyleSet({ suggestedActionsStackedOverflow: 'auto' });
createStyleSet({ suggestedActionsStackedOverflow: 'hidden' });
createStyleSet({ suggestedActionsStackedOverflow: 'scroll' });
createStyleSet({ suggestedActionsStackedOverflow: 'visible' });
