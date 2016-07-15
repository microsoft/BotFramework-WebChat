import { Observable, Subscriber, AjaxResponse } from '@reactivex/rxjs';
import { BotConversation, BotMessage, BotMessageGroup } from './directLineTypes'; 

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
        .map(ajaxResponse => ajaxResponse.response as BotConversation);

export const postMessage = (message:BotMessage, conversation:BotConversation) =>
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

export const getMessages = (conversation:BotConversation) =>
    new Observable<Observable<BotMessage>>((subscriber:Subscriber<Observable<BotMessage>>) =>
        messageGroupGenerator(conversation, subscriber)
    )
    .concatAll();

const messageGroupGenerator = (conversation:BotConversation, subscriber:Subscriber<Observable<BotMessage>>, watermark?:string) => {
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

const getMessageGroup = (conversation:BotConversation, watermark?:string) =>
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
        .map(ajaxResponse => ajaxResponse.response as BotMessageGroup);
