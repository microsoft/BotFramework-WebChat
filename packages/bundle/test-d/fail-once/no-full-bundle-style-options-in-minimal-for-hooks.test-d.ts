import '../setup';

import { expectNotAssignable } from 'tsd';
import '../../src/iife/minimal';

const { hooks } = window['WebChat'];

type StyleOptions = ReturnType<typeof hooks.useStyleOptions>[0];

// const [styleOptions] = hooks.useStyleOptions();

expectNotAssignable<StyleOptions>({ cardEmphasisBackgroundColor: 'black' });

// Equivalent to: styleOptions.cardEmphasisBackgroundColor = 'black';
