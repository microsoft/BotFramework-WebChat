import { createStyleSet } from '../../src/boot/exports/full';

// Related to #4081.
createStyleSet({ suggestedActionsStackedOverflow: 'auto' });
createStyleSet({ suggestedActionsStackedOverflow: 'hidden' });
createStyleSet({ suggestedActionsStackedOverflow: 'scroll' });
createStyleSet({ suggestedActionsStackedOverflow: 'visible' });
