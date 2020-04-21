import parseURLParams from '../utils/parseURLParams';

export default function param(name) {
  const value = parseURLParams(document.location.hash)[name];

  return /^\d+$/.test(value) ? +value : value;
}
