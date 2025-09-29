import once from './private/once';

export default function warnOnce(message: string): (...args: any[]) => void {
  return once((...args: any[]) => console.warn(`botframework-webchat: ${message}`, ...args));
}
