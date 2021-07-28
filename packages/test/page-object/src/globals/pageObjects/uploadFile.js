import getUploadButton from '../pageElements/uploadButton';

export default function uploadFile(filename) {
  return host.upload(getUploadButton(), filename);
}
