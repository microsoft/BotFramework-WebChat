import '../setup';

import { hooks } from '../../src/boot/exports/index';

const [styleOptions] = hooks.useStyleOptions();

styleOptions.cardEmphasisBackgroundColor = 'black';
