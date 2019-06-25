const uuidV4 = require("uuid/v4");
const {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  SharedKeyCredential
} = require("@azure/storage-blob");

const {
  AZURE_STORAGE_ACCOUNT_KEY,
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_CONTAINER_NAME
} = process.env;

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function pad(value, count = 2, delimiter = "0") {
  value += "";
  count -= value.length;

  return new Array(Math.max(0, count)).fill(delimiter).join("") + value;
}

module.exports = (_, res) => {
  // TODO: Verify if the HTTP request is sent from a valid client
  // TODO: Set up storage lifecycle management, https://docs.microsoft.com/en-us/azure/storage/blobs/storage-lifecycle-management-concepts

  const now = new Date();
  const blobName = [
    now.getUTCFullYear(),
    pad(now.getUTCMonth() + 1),
    pad(now.getUTCDate()),
    pad(now.getUTCHours()),
    uuidV4()
  ].join("/");
  const permissions = new BlobSASPermissions();

  permissions.create = true;

  const sasQuery = generateBlobSASQueryParameters(
    {
      blobName,
      containerName: AZURE_STORAGE_CONTAINER_NAME,
      expiryTime: new Date(Date.now() + FIFTEEN_MINUTES),
      permissions: permissions.toString()
    },
    new SharedKeyCredential(
      AZURE_STORAGE_ACCOUNT_NAME,
      AZURE_STORAGE_ACCOUNT_KEY
    )
  );

  res.send({
    sasQuery: sasQuery.toString(),
    url: `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER_NAME}/${blobName}`
  });
};
