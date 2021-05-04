import pageObjects from '../pageObjects/index';

export default function () {
  return window.pageObjects || (window.pageObjects = pageObjects);
}
