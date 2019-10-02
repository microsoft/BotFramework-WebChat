import marshal from '../marshal';

export default function updateProps(driver, mergeProps) {
  return driver.executeScript(mergeProps => {
    window.WebChatTest.updateProps(unmarshal(mergeProps));
  }, marshal(mergeProps));
}
