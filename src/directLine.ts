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
    eTag?: string;
}

interface MessageGroup
{
    messages: Message[],
    watermark?: string,
    eTag?: string
}

const domain = "https://ic-webchat-scratch.azurewebsites.net";
const baseUrl = `${domain}/api/conversations`;
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
            .range(0, 1)
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
//    Observable.of<Conversation>({conversationId:"foo", token:"bar"})

    Observable
        .ajax<AjaxResponse>({
            method: "POST",
            url: `${baseUrl}`,
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
            url: `${baseUrl}/${conversationId}/messages`,
            body: message,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${token}`
            }
        })
        .do(ajaxResponse => console.log("post message response", ajaxResponse.response));

const getMessages = (conversationId:string, token:string) =>
    new Observable<Observable<Message>>((subscriber:Subscriber<Observable<Message>>) =>
        messageGroupGenerator(conversationId, token, subscriber)
    )
    .concatAll();

const getMessageGroup = (conversationId:string, token:string, watermark?:string) =>
//    Observable.of<MessageGroup>({messages:[{conversationId:"foo", text:"hey"}]})

    Observable
        .ajax<AjaxResponse>({
            method: "GET",
            url: `${baseUrl}/${conversationId}/messages` + watermark ? `?watermark=${watermark}` : "",
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${token}`
            }
        })
        .do(ajaxResponse => console.log("MessageGroup", ajaxResponse.response))
        .map(ajaxResponse => ajaxResponse.response as MessageGroup);

const messageGroupGenerator = (conversationId:string, token:string, subscriber:Subscriber<Observable<Message>>, watermark?:string) => {
    console.log("let's get some messages!", conversationId, token, watermark);
    getMessageGroup(conversationId, token, watermark)
    .subscribe({
        next: messageGroup => {
            console.log("messageGroup", messageGroup);
            if (messageGroup)
                subscriber.next(Observable.from(messageGroup.messages));

            setTimeout(
                () => messageGroupGenerator(conversationId, token, subscriber, messageGroup && messageGroup.watermark),
                messageGroup && messageGroup.watermark ? 0 : 3000
            );
        },
        error: result => subscriber.error(result),
    });
}

app();