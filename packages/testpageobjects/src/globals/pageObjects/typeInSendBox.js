import focusSendBoxTextBox from './focusSendBoxTextBox';

export default async function typeInSendBox(...args) {
  await focusSendBoxTextBox();
  await host.sendKeys(...args);
}
