export default function webDriverPort() {
  return (
    window.webDriverPort ||
    (window.webDriverPort = {
      __queue: [],
      postMessage: data => window.webDriverPort.__queue.push({ data, origin: location.href })
    })
  );
}
