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
    id: string,
    conversationId: string,
    created: string,
    from: string,
    text: string,
    channelData: string,
    images?: string[],
    attachments?: Attachment[];
    etag: string;
}

interface MessageGroup
{
    messages: Message[],
    watermark: string,
    eTag: string
}

const baseUrl = "https://ic-webchat-scratch.azurewebsites.net";

const conversation = Observable.ajax<AjaxResponse>({
    method: "POST",
    url: baseUrl + "/api/conversations",
    headers: {
        "Accept": "application/json",
        "Authorization": "BotConnector RCurR_XV9ZA.cwA.BKA.iaJrC8xpy8qbOF5xnR2vtCX7CZj0LdjAPGfiCpg4Fv0" 
    }
})
.map(ajaxResponse => ajaxResponse.response as Conversation);

const foo = conversation.subscribe({
    next: result => console.log("result", result.conversationId),
    error: result => console.log("error", result),
    complete: () => console.log("done")
});

