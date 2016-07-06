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
        var messages = document.getElementById("app");
        getMessages(conversation)
            .subscribe({
                next: message =>  messages.innerHTML += "<p>Received: " + message.text + "</p>",
                error: error => console.log("error getting messages", error),
                complete: () => console.log("done getting messages")
            });

        console.log("let's post some messages!");
        Observable
            .interval(3000)
            .map(i => <Message>
                {
                    conversationId: conversation.conversationId,
                    from: null,
                    text: `Message #${i}`
                })
            .do(message => messages.innerHTML += "<p>Posting: " + JSON.stringify(message) + "</p>")
            .subscribe({
                next: message => 
                    postMessage(message, conversation)
                        .subscribe({
                            next: ajaxResponse => console.log("posted message", ajaxResponse),
                            error: error => console.log("error posting message", error),
                            complete: () => console.log("done posting message")
                        }),
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
            url: `${baseUrl}`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${app_secret}` 
            }
        })
        .do(ajaxResponse => console.log("conversation ajaxResponse", ajaxResponse))
        .map(ajaxResponse => ajaxResponse.response as Conversation);

const postMessage = (message:Message, conversation:Conversation) =>
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
        .do(ajaxResponse => console.log("post message ajaxResponse", ajaxResponse));

const getMessages = (conversation:Conversation) =>
    new Observable<Observable<Message>>((subscriber:Subscriber<Observable<Message>>) =>
        messageGroupGenerator(conversation, subscriber)
    )
    .concatAll();

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

const messageGroupGenerator = (conversation:Conversation, subscriber:Subscriber<Observable<Message>>, watermark?:string) => {
    console.log("let's get some messages!", conversation.conversationId, conversation.token, watermark);
    getMessageGroup(conversation, watermark)
    .subscribe({
        next: messageGroup => {
            const someMessages = messageGroup && messageGroup.messages && messageGroup.messages.length > 0;
            if (someMessages)
                subscriber.next(Observable.from(messageGroup.messages));

            setTimeout(
                () => messageGroupGenerator(conversation, subscriber, messageGroup && messageGroup.watermark),
                someMessages && messageGroup.watermark ? 0 : 3000
            );
        },
        error: result => subscriber.error(result),
    });
}

app();