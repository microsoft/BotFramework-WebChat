import '../setup';

import { hooks } from '../../src/exports/full';

const [styleOptions] = hooks.useStyleOptions();

styleOptions.cardEmphasisBackgroundColor = 'black';
