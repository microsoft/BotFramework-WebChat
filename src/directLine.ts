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
//      conversation.conversationId = '17bHVgYjmwG';
//      conversation.token = 'RCurR_XV9ZA.dAA.MQA3AGIASABWAGcAWQBqAG0AdwBHAA.ttGtI73W0QE.7FdDj5c4l8s.T5bgqhfhF3OSlkNbjki74Zi7XerxOamQhwF6AB-v9FA';
        getMessages(conversation.conversationId, conversation.token)
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
                    postMessage(message, conversation.conversationId, conversation.token)
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
        .do(ajaxResponse => console.log("conversation ajaxResponse", ajaxResponse))
        .map(ajaxResponse => ajaxResponse.response as Conversation);

const postMessage = (message:Message, conversationId:string, token:string) =>
    Observable
        .ajax<AjaxResponse>({
            method: "POST",
            url: `${baseUrl}/${conversationId}/messages`,
            body: message,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `BotConnector ${token}`
            }
        })
        .do(ajaxResponse => console.log("post message ajaxResponse", ajaxResponse));

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
            url: `${baseUrl}/${conversationId}/messages?watermark=${watermark}`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${token}`
            }
        })
        .do(ajaxResponse => console.log("get messages ajaxResponse", ajaxResponse))
        .map(ajaxResponse => ajaxResponse.response as MessageGroup);

const messageGroupGenerator = (conversationId:string, token:string, subscriber:Subscriber<Observable<Message>>, watermark?:string) => {
    console.log("let's get some messages!", conversationId, token, watermark);
    getMessageGroup(conversationId, token, watermark)
    .subscribe({
        next: messageGroup => {
            const someMessages = messageGroup && messageGroup.messages && messageGroup.messages.length > 0;
            if (someMessages)
                subscriber.next(Observable.from(messageGroup.messages));

            setTimeout(
                () => messageGroupGenerator(conversationId, token, subscriber, messageGroup && messageGroup.watermark),
                someMessages && messageGroup.watermark ? 0 : 3000
            );
        },
        error: result => subscriber.error(result),
    });
}

app();