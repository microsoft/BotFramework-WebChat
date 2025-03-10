import root from './root';

export default function microphoneButton() {
  return root().querySelector(`button[title="Speak"]`);
}
