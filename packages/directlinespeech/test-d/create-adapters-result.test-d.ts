import { createAdapters } from 'botframework-directlinespeech-sdk';
import { expectError, expectType } from 'tsd';

// Declared as an interface (without an index signature), like `Activity` in `botframework-directlinejs`.
interface MessageActivity {
  from: { id: string; role?: 'bot' | 'user' };
  text: string;
  type: 'message';
}

(async () => {
  const { directLine, webSpeechPonyfillFactory } = await createAdapters({
    fetchCredentials: { authorizationToken: '...', region: 'westus2' }
  });

  directLine.activity$.subscribe(activity => expectType<string | undefined>(activity.type));
  directLine.connectionStatus$.subscribe(connectionStatus => expectType<number>(connectionStatus));

  const activity: MessageActivity = { from: { id: 'u00001', role: 'user' }, text: 'Hello, World!', type: 'message' };

  directLine.postActivity(activity).subscribe(id => expectType<string>(id));

  expectType<void>(directLine.end());

  const { SpeechGrammarList, SpeechRecognition, speechSynthesis, SpeechSynthesisUtterance } =
    webSpeechPonyfillFactory();

  // Empty when the browser does not support Web Audio API.
  expectType<SpeechSynthesis | undefined>(speechSynthesis);
  expectType<typeof globalThis.SpeechSynthesisUtterance | undefined>(SpeechSynthesisUtterance);

  SpeechGrammarList && new SpeechGrammarList();
  SpeechRecognition && new SpeechRecognition();

  // The factory does not return `SpeechRecognitionEvent`.
  expectError(webSpeechPonyfillFactory().SpeechRecognitionEvent);
})();
