export default function fetchJSON(url, options) {
  return window
    .fetch(url, options)
    .then(res => (res.ok ? res.json() : Promise.reject(new Error(`Server returned ${res.status}`))));
}
