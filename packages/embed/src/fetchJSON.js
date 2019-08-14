import { fetch } from 'whatwg-fetch';

export default function fetchJSON(url, options) {
  return fetch(url, options).then(res =>
    res.ok ? res.json() : Promise.reject(new Error(`Server returned ${res.status}`))
  );
}
