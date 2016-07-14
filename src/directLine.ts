import { Observable, Subscriber, AjaxResponse } from '@reactivex/rxjs';
import { Conversation, Message, MessageGroup } from './directLineTypes'; 

const domain = "https://ic-webchat-scratch.azurewebsites.net";
const baseUrl = `${domain}/api/conversations`;
const app_secret = "RCurR_XV9ZA.cwA.BKA.iaJrC8xpy8qbOF5xnR2vtCX7CZj0LdjAPGfiCpg4Fv0";

export const startConversation = () =>
    Observable
        .ajax<AjaxResponse>({
            method: "POST",
            url: `${baseUrl}`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${app_secret}` 
            }
        })
        .do(ajaxResponse => console.log("conversation ajaxResponse", ajaxResponse))
        .map(ajaxResponse => ajaxResponse.response as Conversation);

export const postMessage = (message:Message, conversation:Conversation) =>
    Observable
        .ajax<AjaxResponse>({
            method: "POST",
            url: `${baseUrl}/${conversation.conversationId}/messages`,
            body: message,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `BotConnector ${conversation.token}`
            }
        })
        .do(ajaxResponse => console.log("post message ajaxResponse", ajaxResponse))
        .map(ar => true)

export const getMessages = (conversation:Conversation) =>
    new Observable<Observable<Message>>((subscriber:Subscriber<Observable<Message>>) =>
        messageGroupGenerator(conversation, subscriber)
    )
    .concatAll();

const messageGroupGenerator = (conversation:Conversation, subscriber:Subscriber<Observable<Message>>, watermark?:string) => {
    console.log("let's get some messages!", conversation.conversationId, conversation.token, watermark);
    getMessageGroup(conversation, watermark).subscribe(
        messageGroup => {
            const someMessages = messageGroup && messageGroup.messages && messageGroup.messages.length > 0;
            if (someMessages)
                subscriber.next(Observable.from(messageGroup.messages));

            setTimeout(
                () => messageGroupGenerator(conversation, subscriber, messageGroup && messageGroup.watermark),
                someMessages && messageGroup.watermark ? 0 : 3000
            );
        },
        result => subscriber.error(result)
    );
}

const getMessageGroup = (conversation:Conversation, watermark?:string) =>
    Observable
        .ajax<AjaxResponse>({
            method: "GET",
            url: `${baseUrl}/${conversation.conversationId}/messages?watermark=${watermark}`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${conversation.token}`
            }
        })
        .do(ajaxResponse => console.log("get messages ajaxResponse", ajaxResponse))
        .map(ajaxResponse => ajaxResponse.response as MessageGroup);
