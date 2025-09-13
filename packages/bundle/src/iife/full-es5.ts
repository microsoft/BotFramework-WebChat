import buildInfo from '../buildInfo';
import './full';
import './polyfill/es5';

// TODO: [P*] This would add "full" first, then replace it with "full-es5".
buildInfo.set('variant', 'full-es5');
