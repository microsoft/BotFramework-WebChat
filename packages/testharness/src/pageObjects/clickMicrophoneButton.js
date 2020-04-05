import getMicrophoneButton from '../elements/microphoneButton';

const { Simulate } = window.ReactTestUtils;

export default async function clickMicrophoneButton() {
  Simulate.click(getMicrophoneButton());
}
