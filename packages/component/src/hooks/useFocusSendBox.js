import useFocus from './useFocus';

let showDeprecationNotes = true;

export default function useFocusSendBox() {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useFocusSendBox" is deprecated and will be removed on or after 2022-04-21. Please use "useFocus(\'sendBox\')" instead.'
    );

    showDeprecationNotes = false;
  }

  return useFocus().bind(null, 'sendBox');
}
