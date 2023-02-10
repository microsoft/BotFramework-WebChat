import { hooks } from 'botframework-webchat-api';
import { useMemo } from 'react';

const { useConnectivityStatus, useSendBoxValue } = hooks;

/**
 * Returns `true` if send box can be submitted, otherwise, `false`.
 *
 * Currently, there are two reasons why the send box cannot be submitted:
 *
 * 1. Offline
 * 2. Send box value is empty
 *    - It mimic the current logic, however, the current logic is a not insufficient
 *    - Better, checks if *trimmed* send box value is empty
 *
 * This is an internal hook and should not be public/exported.
 * Primarily, because this logic is a duplication of the logic in Redux.
 */
export default function useCanSubmitSendBox(): readonly [boolean] {
  const [connectivityStatus] = useConnectivityStatus();
  const [sendBoxValue] = useSendBoxValue();

  const canSubmitSendBox = connectivityStatus === 'connected' && !!sendBoxValue;

  return useMemo(() => Object.freeze([canSubmitSendBox]) as readonly [boolean], [canSubmitSendBox]);
}
