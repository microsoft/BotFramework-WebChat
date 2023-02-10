import useSendBoxContext from './private/useContext';

/**
 * Subscribes to the `IDREF` of the error message occurred when the user submit the send box.
 *
 * This `IDREF` is intended to be use as the value for `aria-errormessage` and `aria-invalid` attribute.
 *
 * For example, if the user is clicking on the send button without a message, we will read an alert saying "cannot
 * send empty message." This `IDREF` will be the HTML element of the hidden alert element.
 *
 * If there are no errors when submitting the send box, the `IDREF` will be `undefined`.
 */
export default function useSubmitErrorMessageId(): readonly [string | undefined] {
  return useSendBoxContext().submitErrorMessageIdState;
}
