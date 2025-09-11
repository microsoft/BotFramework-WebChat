import '../setup';

import { hooks } from '../../src/boot/exports/full';

const [styleOptions] = hooks.useStyleOptions();

styleOptions.cardEmphasisBackgroundColor = 'black';
