import { type WebChatAPIContextType } from '../WebChatAPIContext';
import { type Source } from './Source';
import createDomainContext from './private/createDomainContext';

type SpeechContextType = {
  readonly dictateInterims: Source<string[] | undefined>;
  readonly dictateState: Source<number>;
  readonly setDictateInterims: WebChatAPIContextType['setDictateInterims'];
  readonly setDictateState: WebChatAPIContextType['setDictateState'];
  readonly shouldSpeakIncomingActivity: Source<boolean>;
  readonly startDictate: WebChatAPIContextType['startDictate'];
  readonly startSpeakingActivity: WebChatAPIContextType['startSpeakingActivity'];
  readonly stopDictate: WebChatAPIContextType['stopDictate'];
  readonly stopSpeakingActivity: WebChatAPIContextType['stopSpeakingActivity'];
};

const [SpeechContext, useSpeechContext] = createDomainContext<SpeechContextType>('WebChatSpeechContext');

export default SpeechContext;
export { useSpeechContext, type SpeechContextType };
