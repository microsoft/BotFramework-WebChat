import { Observable, AjaxResponse } from '@reactivex/rxjs';

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

const thisConversation = Observable
    .ajax<AjaxResponse>({
        method: "POST",
        url: `${baseUrl}/api/conversations`,
        headers: {
            "Accept": "application/json",
            "Authorization": `BotConnector ${app_secret}` 
        }
    })
    .first()
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
    });

thisConversation.subscribe({
    next: conversation => {
        const testMessage:Message = {
            conversationId: conversation.conversationId,
            from:null,
            text: "Boy Howdy"
        }
        postMessage(testMessage, conversation.conversationId, conversation.token).subscribe({
            error: error => console.log("error posting message", error),
            complete: () => console.log("done posting message")
        })
    },
    error: result => console.log("error starting conversation", result),
    complete: () => console.log("done starting conversation")
});

