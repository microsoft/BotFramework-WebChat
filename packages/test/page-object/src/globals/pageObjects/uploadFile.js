import allOutgoingActivitiesSent from '../pageConditions/allOutgoingActivitiesSent';
import getUploadButton from '../pageElements/uploadButton';

export default async function uploadFile(filename, { waitForSend = true } = {}) {
  await host.upload(getUploadButton(), filename);

  waitForSend && (await allOutgoingActivitiesSent());
}
