// Entry of the browser scripts: like the former webpack build (`libraryTarget: 'window'`), assigns `window.DirectLineSpeech`.
import * as DirectLineSpeech from './index';

window.DirectLineSpeech = DirectLineSpeech;
