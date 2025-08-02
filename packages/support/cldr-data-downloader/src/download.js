/**
 * Download tool for Unicode CLDR JSON data
 *
 * Copyright 2021 Microsoft Corporation
 * Copyright 2013 Rafael Xavier de Souza
 *
 * Released under the MIT license
 */

'use strict';

import Q from 'q';
import path from 'path';
import fs from 'fs';

const workingDir = process.cwd();

function getFetchOptions(options) {
  const fetchOptions = {
    method: 'GET',
    redirect: 'follow', // equivalent to followRedirect: true
    headers: {
      'User-Agent': 'curl/7.21.4 (universal-apple-darwin11.0) libcurl/7.21.4 OpenSSL/0.9.8r zlib/1.2.5'
    }
  };

  // Merge any additional options
  if (options && options.headers) {
    fetchOptions.headers = { ...fetchOptions.headers, ...options.headers };
  }

  return fetchOptions;
}

function fetchFromFilesystem(src) {
  const fsDfd = Q.defer();

  // We don't need any options here, so we just grab the url
  // and make sure it fits the norms for our platform.
  const givenFilePath = path.normalize(src.url);

  function notify(state) {
    fsDfd.notify(state);
  }

  let filePath;

  // Test if the file path is absolute. If not, then prepend the application
  // directory beforehand, so it can be treated as relative from the app root.
  if (path.isAbsolute(givenFilePath)) {
    filePath = givenFilePath;
  } else {
    filePath = path.join(workingDir, givenFilePath);
  }

  // eslint-disable-next-line no-console
  console.log('Retrieving `' + filePath + '`');

  // Getting the errors and size right on the progress bar here is not worth all the setup.
  // Just fail silently here if there's a problem and the error will correctly bubble in the
  // readFile call below.
  let totalSize = 0;

  try {
    // TODO: Consider in-memory file system.
    // TODO: Turn this into async.
    // eslint-disable-next-line security/detect-non-literal-fs-filename, node/no-sync
    const stats = fs.statSync(filePath);

    totalSize = stats.size;

    // eslint-disable-next-line no-empty
  } catch (e) {}

  // We're gonna go from 0->100 with nothing between for fs.readFile. We could alternatively
  // do a readStream, but it seems like overkill for the filesizes.
  notify({ total: totalSize, received: 0, percent: 0 });

  // Async request the file
  // TODO: Consider in-memory file system.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFile(filePath, (error, fileBody) => {
    if (error) {
      error.message =
        'Error retrieving file from disk.\n' +
        error.stack +
        '\n\nPlease report this full log at https://github.com/rxaviers/cldr-data-downloader';

      fsDfd.reject(error);

      throw error;
    }

    notify({ total: totalSize, received: fileBody.length, percent: 100 });

    fsDfd.resolve(fileBody);
  });

  return fsDfd.promise;
}

function download(src) {
  src.url = src.url.trim();

  // Modify the url to not be a file protocol uri so we can unify handling files.
  src.url = src.url.replace(/^file:\/\//iu, '');

  // Short circuit the download function and grab it from the filesystem if
  // we don't have anything that looks like a protocol (e.g. https/http/ftp/etc).
  if (!~src.url.indexOf('://')) {
    return fetchFromFilesystem(src);
  }

  const downloadDfd = Q.defer();
  const options = getFetchOptions(src);

  function notify(state) {
    downloadDfd.notify(state);
  }

  // eslint-disable-next-line no-console
  console.log('GET `' + src.url + '`');

  // Use fetch instead of request
  fetch(src.url, options)
    .then(async response => {
      if (!response.ok) {
        const error = new Error(
          'Error requesting archive.\nStatus: ' +
            response.status +
            '\nRequest options: ' +
            // eslint-disable-next-line no-magic-numbers
            JSON.stringify(options, null, 2) +
            '\nResponse headers: ' +
            // eslint-disable-next-line no-magic-numbers
            JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2) +
            '\nMake sure your network and proxy settings are correct.\n\nIf you continue to have issues, please report this full log at https://github.com/rxaviers/cldr-data-downloader'
        );
        downloadDfd.reject(error);
        throw error;
      }

      // Get the content length for progress tracking
      const contentLength = parseInt(response.headers.get('content-length'), 10);
      const reader = response.body.getReader();
      const chunks = [];
      let receivedLength = 0;

      // Read the response in chunks to track progress
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;

        // Notify progress if we have content length
        if (contentLength) {
          // eslint-disable-next-line no-magic-numbers
          const percent = Math.round((receivedLength / contentLength) * 100);
          notify({ total: contentLength, received: receivedLength, percent });
        }
      }

      // Combine all chunks into a single buffer
      const body = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        body.set(chunk, position);
        position += chunk.length;
      }

      // Final progress notification
      notify({ total: receivedLength, received: receivedLength, percent: 100 });

      downloadDfd.resolve(Buffer.from(body));
    })
    .catch(error => {
      error.message =
        'Error making request.\n' +
        error.stack +
        '\n\nPlease report this full log at https://github.com/rxaviers/cldr-data-downloader';

      downloadDfd.reject(error);
      throw error;
    });

  return downloadDfd.promise;
}

export default download;
