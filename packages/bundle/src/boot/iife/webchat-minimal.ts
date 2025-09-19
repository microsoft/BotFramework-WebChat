import buildInfo from '../../buildInfo';
import * as decorator from '../actual/decorator';
import * as internal from '../actual/internal';
import * as middleware from '../actual/middleware';
import * as actual from '../actual/minimalSet';

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
const { createStoreWithDevTools: _createStoreWithDevTools, ...exports } = actual;

window['WebChat'] = Object.freeze({
  ...window['WebChat'], // Should be undefined, but just in case.
  ...exports,
  buildInfo: buildInfo.object,
  decorator,
  internal,
  middleware
});
