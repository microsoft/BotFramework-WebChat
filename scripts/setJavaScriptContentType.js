const { extname } = require('path');

const {
  Aborter,
  BlobURL,
  ContainerURL,
  ServiceURL,
  SharedKeyCredential,
  StorageURL
} = require('@azure/storage-blob');

const BLOB_DELIMITER = '/';
const BLOB_OPERATION_TIMEOUT = 15000;
const TARGET_EXTNAME = '.js';
const TARGET_CONTENT_TYPE = 'text/javascript; charset=utf-8';

async function main(accountName, accountKey, container, prefix) {
  const containerURL = ContainerURL.fromServiceURL(
    new ServiceURL(
      `https://${ accountName }.blob.core.windows.net`,
      StorageURL.newPipeline(new SharedKeyCredential(accountName, accountKey))
    ),
    container
  );

  const { segment } = await containerURL.listBlobHierarchySegment(
    Aborter.timeout(BLOB_OPERATION_TIMEOUT),
    BLOB_DELIMITER,
    null,
    { prefix }
  );

  console.log([
    `Found ${ segment.blobItems.length } blob in container "${ container }" with prefix "${ prefix || '' }"`,
    ...segment.blobItems.map(({ name, properties: { contentLength } }) => `  ${ name } (${ contentLength } bytes)`),
    ''
  ].join('\n'));

  await Promise.all(
    segment.blobItems
      .filter(({ name }) => extname(name) === TARGET_EXTNAME)
      .map(async ({ name }) => {
        console.log(`Setting content type for blob "${ name }"`);

        const blobURL = BlobURL.fromContainerURL(containerURL, name);

        await blobURL.setHTTPHeaders(
          Aborter.timeout(BLOB_OPERATION_TIMEOUT),
          {
            blobContentType: TARGET_CONTENT_TYPE
          }
        )
      })
  );
}

main(process.env.CDN_BLOB_ACCOUNT, process.env.CDN_BLOB_KEY, ...process.argv.slice(2)).catch(err => console.error(err));
