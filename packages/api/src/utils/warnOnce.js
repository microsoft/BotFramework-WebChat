export default function warnOnce(message) {
  let warned;

  return () => {
    if (!warned) {
      console.warn(`botframework-webchat: ${message}.`);
      warned = 1;
    }
  };
}
