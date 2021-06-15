export default function warnOnce(message: string): () => void {
  let warned;

  return () => {
    if (!warned) {
      console.warn(`botframework-webchat: ${message}.`);
      warned = 1;
    }
  };
}
