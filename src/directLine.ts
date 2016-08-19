import { Observable, Subscriber, AjaxResponse, AjaxRequest } from '@reactivex/rxjs';
import { BotConversation, BotMessage, BotMessageGroup } from './directLineTypes'; 

const domain = "https://directline.botframework.com";
const baseUrl = `${domain}/api/conversations`;

export const imageURL = (path:string) => domain + path;

export const startConversation = (appSecret: string) =>
    Observable
        .ajax({
            method: "POST",
            url: `${baseUrl}`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${appSecret}` 
            }
        })
//        .do(ajaxResponse => console.log("conversation ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => ajaxResponse.response as BotConversation);

export const postMessage = (text: string, conversation: BotConversation, userId: string) =>
    Observable
        .ajax({
            method: "POST",
            url: `${baseUrl}/${conversation.conversationId}/messages`,
            body: {
                text: text,
                from: userId,
                conversationId: conversation.conversationId
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": `BotConnector ${conversation.token}`
            }
        })
//        .do(ajaxResponse => console.log("post message ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => true);

export const postFile = (file: File, conversation: BotConversation) => {
    const formData = new FormData();
    formData.append('file', file);
    return Observable
        .ajax({
            method: "POST",
            url: `${baseUrl}/${conversation.conversationId}/upload`,
            body: formData,
            headers: {
                "Authorization": `BotConnector ${conversation.token}`
            }
        })
//        .do(ajaxResponse => console.log("post file ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => true)
}

export const getMessages = (conversation: BotConversation) =>
    new Observable<Observable<BotMessage>>((subscriber:Subscriber<Observable<BotMessage>>) =>
        messagesGenerator(conversation, subscriber)
    )
    .concatAll();

const messagesGenerator = (conversation: BotConversation, subscriber: Subscriber<Observable<BotMessage>>, watermark?: string) => {
    getMessageGroup(conversation, watermark).subscribe(
        messageGroup => {
            const someMessages = messageGroup && messageGroup.messages && messageGroup.messages.length > 0;
            if (someMessages)
                subscriber.next(Observable.from(messageGroup.messages));

            setTimeout(
                () => messagesGenerator(conversation, subscriber, messageGroup && messageGroup.watermark),
                someMessages && messageGroup.watermark ? 0 : 3000
            );
        },
        error => subscriber.error(error)
    );
}

const getMessageGroup = (conversation: BotConversation, watermark = "") =>
    Observable
        .ajax({
            method: "GET",
            url: `${baseUrl}/${conversation.conversationId}/messages?watermark=${watermark}`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${conversation.token}`
            }
        })
//        .do(ajaxResponse => console.log("get messages ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => ajaxResponse.response as BotMessageGroup);
