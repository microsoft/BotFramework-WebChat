import { type WebChatAPIContextType } from '../WebChatAPIContext';
import createDomainContext from './private/createDomainContext';

/** The setters of speech. Its dictate interims, dictate state and should speak are slices: `SpeechSlices`. */
type SpeechContextType = {
  readonly setDictateInterims: WebChatAPIContextType['setDictateInterims'];
  readonly setDictateState: WebChatAPIContextType['setDictateState'];
  readonly startDictate: WebChatAPIContextType['startDictate'];
  readonly startSpeakingActivity: WebChatAPIContextType['startSpeakingActivity'];
  readonly stopDictate: WebChatAPIContextType['stopDictate'];
  readonly stopSpeakingActivity: WebChatAPIContextType['stopSpeakingActivity'];
};

const [SpeechContext, useSpeechContext] = createDomainContext<SpeechContextType>('WebChatSpeechContext');

export default SpeechContext;
export { useSpeechContext, type SpeechContextType };
