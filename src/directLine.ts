import { Observable, Subscriber, AjaxResponse } from '@reactivex/rxjs';

const source = Observable.ajax({ method:"GET", url: "myurl" });

interface Conversation {
    conversationId: string,
    token: string,
    eTag?: string
}

interface Attachment {
    url: string,
    contentType: string
}

interface Message
{
    id?: string,
    conversationId: string,
    created?: string,
    from?: string,
    text?: string,
    channelData?: string,
    images?: string[],
    attachments?: Attachment[];
    etag?: string;
}

interface MessageGroup
{
    messages: Message[],
    watermark: string,
    eTag: string
}

const baseUrl = "https://ic-webchat-scratch.azurewebsites.net";
const app_secret = "RCurR_XV9ZA.cwA.BKA.iaJrC8xpy8qbOF5xnR2vtCX7CZj0LdjAPGfiCpg4Fv0";

const app = () =>
    startConversation().first().do(conversation => {
        getMessages(conversation.conversationId, conversation.token)
            .subscribe({
                next: message => console.log("got message", message),
                error: error => console.log("error getting messages", error),
                complete: () => console.log("done getting messages")
            });

        console.log("let's post some messages!");
        Observable
            .range(0, 30)
            .map(i => <Message>
                {
                    conversationId: conversation.conversationId,
                    from: null,
                    text: `Message #${i}`
                })
            .delay(0)
            .do(message => console.log("preparing to post message", message))
            .map(message => postMessage(message, conversation.conversationId, conversation.token))
            .subscribe({
                next: ajaxResponse => console.log("posted message"),
                error: error => console.log("error posting messages", error),
                complete: () => console.log("done posting messages")
            });
    })
    .subscribe({
        next: conversation => console.log("got the conversation", conversation),
        error: result => console.log("error starting conversation", result),
        complete: () => console.log("done starting conversation")
    });

const startConversation = () =>
    Observable
        .ajax<AjaxResponse>({
            method: "POST",
            url: `${baseUrl}/api/conversations`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${app_secret}` 
            }
        })
        .do(ajaxResponse => console.log("conversation", ajaxResponse.response))
        .map(ajaxResponse => ajaxResponse.response as Conversation);

const postMessage = (message:Message, conversationId:string, token:string) =>
    Observable
        .ajax<AjaxResponse>({
            method: "POST",
            url: `${baseUrl}/api/conversations/${conversationId}/messages`,
            body: message,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${token}`
            }
        })
        .do(ajaxResponse => console.log("post message response", ajaxResponse.response));

const getMessageGroup = (conversationId:string, token:string, watermark?:string) =>
    Observable
        .ajax<AjaxResponse>({
            method: "GET",
            url: `${baseUrl}/api/conversations/${conversationId}/messages` + watermark ? `?watermark=${watermark}` : "",
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${token}`
            }
        })
        .do(ajaxResponse => console.log("MessageGroup", ajaxResponse.response))
        .map(ajaxResponse => ajaxResponse.response as MessageGroup);

const getMessages = (conversationId:string, token:string) =>
    new Observable<Observable<Message>>((subscriber:Subscriber<Observable<Message>>) => {
        var watermark:string;
        while(true) {
            console.log("let's get some messages!");
            getMessageGroup(conversationId, token, watermark)
            .delay(watermark ? 0 : 1000) // This is not the right place for this
            .subscribe({
                next: messageGroup => {
                    subscriber.next(Observable.from(messageGroup.messages));
                    watermark = messageGroup.watermark;
                },
                error: result => subscriber.error(result),
                complete: () => subscriber.complete()
            });
        }
    })
    .concatAll();

app();