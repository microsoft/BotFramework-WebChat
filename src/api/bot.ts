import {Observable} from 'rxjs';

export const verifyConversation = (
    baseUrl: string,
    directLineSecret: string,
    msftConversationId: string,
    msftUserId: string,
    originatingUrl: string,
    success: (res: any) => void,
    error: (err: any) => void
) => {
    Observable.ajax.post(`${baseUrl}/api/v1/bot/conversations`, {
        msft_conversation_id: msftConversationId,
        originating_url: originatingUrl,
        msft_user_id: msftUserId,
        directLine: directLineSecret
    })
    .subscribe(
        (xhr: any) => success(xhr),
        (err: any) => error(err)
    );
};
