import pageElements from '../pageElements/index';

export default function () {
  return window.pageElements || (window.pageElements = pageElements);
}
