import useSendBoxContext from './private/useContext';

type SubmitOptions = {
  setFocus?: 'main' | 'sendBox' | 'sendBoxWithoutKeyboard';
};

/**
 * Returns a callback function, when called, will send the value of the text box as a message.
 *
 * If the message cannot be send immediately, for example, the message is empty. An error message will be read
 * and the error message element can be referenced by `useErrorMessageId()` hook.
 *
 * If the message can be send, after the message is queued, regardless whether it send successfully or not, the text box will be cleared.
 */
export default function useSubmit(): (submitOptions?: SubmitOptions) => void {
  return useSendBoxContext().submit;
}
