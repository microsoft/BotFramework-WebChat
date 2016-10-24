import { Observable } from '@reactivex/rxjs';
import { BotConversation, BotMessage, BotMessageGroup } from './BotConnection'; 

export const startConversation = () =>
    Observable.of(<BotConversation> {
        conversationId: "foo",
        token: "bar"
    });

export const postMessage = (message:BotMessage, conversation:BotConversation) =>
    Observable.of(true);

export const getMessages = (conversation:BotConversation) =>
    Observable.interval(2000)
        .map(i => <BotMessage>{
            conversationId: conversation.conversationId,
            from: "bot",
            text: `sample text #${i}`
        });
