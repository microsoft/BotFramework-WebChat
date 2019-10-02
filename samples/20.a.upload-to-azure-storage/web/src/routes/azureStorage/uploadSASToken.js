const uuidV4 = require('uuid/v4');
const { BlobSASPermissions, generateBlobSASQueryParameters, SharedKeyCredential } = require('@azure/storage-blob');

const { AZURE_STORAGE_ACCOUNT_KEY, AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_CONTAINER_NAME } = process.env;

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function pad(value, count = 2, delimiter = '0') {
  value += '';
  count -= value.length;

  return new Array(Math.max(0, count)).fill(delimiter).join('') + value;
}

module.exports = (_, res) => {
  // Before issuing a SAS token, you should make sure the client is valid.
  // Giving the SAS token to the client also means they can upload huge file and increase your spending significantly.
  // The other way is to use a proxied connection to Azure Storage, so you can control the size of the upload.

  const now = new Date();
  const blobName = [
    now.getUTCFullYear(),
    pad(now.getUTCMonth() + 1),
    pad(now.getUTCDate()),
    pad(now.getUTCHours()),
    uuidV4()
  ].join('/');
  const permissions = new BlobSASPermissions();

  // We only allow create permissions, so the user cannot use the URL to redownload the file to redistribute it.
  permissions.create = true;

  const sasQuery = generateBlobSASQueryParameters(
    {
      blobName,
      containerName: AZURE_STORAGE_CONTAINER_NAME,
      expiryTime: new Date(Date.now() + FIFTEEN_MINUTES),
      permissions: permissions.toString()
    },
    new SharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY)
  );

  res.send({
    sasQuery: sasQuery.toString(),
    url: `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER_NAME}/${blobName}`
  });
};
