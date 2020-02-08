import getToasterExpander from '../elements/getToasterExpander';

export default async function clickToasterExpander(driver) {
  const toasterExpander = await getToasterExpander(driver);

  await toasterExpander.click();
}
