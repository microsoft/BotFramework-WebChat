import axios from 'axios';
import {Observable} from 'rxjs';

export const verifyConversation = (
    baseUrl: string,
    msftConversationId: string,
    msftUserId: string,
    directLine: string,
    originatingUrl: string,
    success: (res: any) => void,
    error: (err: any) => void
) => {
    axios.post(`${baseUrl}/api/v1/bot/conversations`, {
        msft_conversation_id: msftConversationId,
        originating_url: originatingUrl,
        msft_user_id: msftUserId,
        directLine
    })
    .then(res => success(res))
    .catch(err => success(err));
};

export const ping = (
    baseUrl: string,
    msftConversationId: string,
    directLine: string,
    success: (res: any) => void,
    error: (err: any) => void
) => {
    axios.post(`${baseUrl}/api/v1/leads/ping`, {
        msft_conversation_id: msftConversationId,
        directLine
    })
    .then(res => {
        if (success) { success(res); }
    })
    .catch (err => {
        if (error) { error(err); }
    });
};
