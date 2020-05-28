export default function parseURLParams(search) {
  return search
    .replace(/^[#\?]/, '')
    .split('&')
    .reduce((params, keyValue) => {
      const [key, value] = keyValue.split('=');
      const decodedKey = decodeURIComponent(key);

      if (key && key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
        params[decodedKey] = decodeURIComponent(value);
      }

      return params;
    }, {});
}
