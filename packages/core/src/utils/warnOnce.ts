import once from './once';

export default function warnOnce(message: string): () => void {
  return once(() => console.warn(`botframework-webchat: ${message}.`));
}
