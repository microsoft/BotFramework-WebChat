import getToasterHeader from '../elements/getToasterHeader';

export default async function clickToasterHeader(driver) {
  const toasterHeader = await getToasterHeader(driver);

  await toasterHeader.click();
}
