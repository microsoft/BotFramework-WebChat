/**
 * `MessagePort` from browser to Jest.
 *
 * Jest will frequently poll the content of `window.webDriver.__queue`.
 */
export default function () {
  return (
    window.webDriverPort ||
    (window.webDriverPort = {
      __queue: [],
      postMessage: data => window.webDriverPort.__queue.push({ data, origin: location.href })
    })
  );
}
