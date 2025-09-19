import '../setup';

import { hooks } from '../../src/boot/actual/full';

const [styleOptions] = hooks.useStyleOptions();

styleOptions.cardEmphasisBackgroundColor = 'black';
