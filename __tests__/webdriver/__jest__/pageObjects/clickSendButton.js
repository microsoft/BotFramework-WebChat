import getSendButton from '../elements/getSendButton';

export default async function clickSendButton(driver) {
  (await getSendButton(driver)).click();
}
