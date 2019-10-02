/* eslint global-require: "off" */

// We adopted the work from mime-wrapper, at https://github.com/marlon360/mime-wrapper.

// This file wraps the mime library constructor to include '.json' types. This is needed
// to support Angular CLI web projects, in which the webpack.config files are hidden away
// from the user, and do not support .json file extension module resolutions.
//
// Refer to issue https://github.com/jshttp/mime-types/issues/50#issuecomment-390932678
// and issue https://github.com/broofa/node-mime/issues/208.
//
// This file may need to change if the mime library is bumped a major that may cause a
// breaking change, as it relies on the internal library file placement.

// MIT License
//
// Copyright (c) 2018 Marlon Lückert
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import Mime from 'mime/Mime';

export default new Mime(require('mime/types/standard'), require('mime/types/other'));
