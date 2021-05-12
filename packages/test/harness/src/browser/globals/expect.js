import expect from 'expect';

export default function () {
  return window.expect || (window.expect = expect);
}
