import useStyleOptions from '../useStyleOptions';
import useCapabilities from '../../providers/Capabilities/useCapabilities';

/**
 * Internal hook to determine if the microphone button should be shown based on:
 * - `showMicrophoneButton` style option ('auto' | 'hide')
 * - Adapter voice capability (voiceConfiguration)
 *
 * - 'auto': Show if adapter has voiceConfiguration capability, hide otherwise
 * - 'hide': Never show
 */
export default function useShouldShowMicrophoneButton(): boolean {
  const [{ showMicrophoneButton }] = useStyleOptions();
  // If adapter has voice capability, voiceConfiguration will be defined,
  const voiceConfiguration = useCapabilities(caps => caps.voiceConfiguration);

  if (showMicrophoneButton === 'hide') {
    return false;
  }

  return !!voiceConfiguration;
}
