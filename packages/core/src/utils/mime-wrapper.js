// This file wraps the mime library constructor to include '.json' types. This is needed
// to support Angular CLI web projects, in which the webpack.config files are hidden away
// from the user, and do not support .json file extension module resolutions.
 
// Refer to issue https://github.com/jshttp/mime-types/issues/50#issuecomment-390932678
// and issue https://github.com/broofa/node-mime/issues/208.
 
// This file may need to change if the mime library is bumped a major that may cause a
// breaking change, as it relies on the internal library file placement.

import Mime from 'mime/Mime';

export default new Mime(
  require('mime/types/standard.json'), 
  require('mime/types/other.json')
)
