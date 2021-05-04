import pageConditions from '../pageConditions/index';

export default function () {
  return window.pageConditions || (window.pageConditions = pageConditions);
}
