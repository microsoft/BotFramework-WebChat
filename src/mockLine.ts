import { Observable } from '@reactivex/rxjs';
import { Conversation, Message, MessageGroup } from './directLineTypes'; 

export const startConversation = () =>
    Observable.of(<Conversation> {
        conversationId: "foo",
        token: "bar"
    });

export const postMessage = (message:Message, conversation:Conversation) =>
    Observable.of(true);

export const getMessages = (conversation:Conversation) =>
    Observable.interval(2000)
        .map(i => <Message>{
            conversationId: conversation.conversationId,
            from: "bot",
            text: `sample text #${i}`
        });
