import axios from 'axios';

export const verifyConversation = (
    baseUrl: string,
    msftConversationId: string,
    msftUserId: string,
    directLine: string,
    originatingUrl: string
): any => {
    return axios.post(`${baseUrl}/api/v1/bot/conversations`, {
        msft_conversation_id: msftConversationId,
        originating_url: originatingUrl,
        msft_user_id: msftUserId,
        directLine
    });
};

export const step = (
    baseUrl: string,
    msftConversationId: string,
    directLine: string,
    messageId: string
): any => {
    return axios.post(`${baseUrl}/api/v1/bot/step`, {
        msft_conversation_id: msftConversationId,
        directLine,
        message_id: messageId
    });
};

export const conversationHistory = (
    baseUrl: string,
    directLine: string,
    conversationId: string,
    lastMessageId: string = null
): any => {
    return axios.get(`${baseUrl}/api/v1/conversations/history?conversation_id=${conversationId}&directLine=${directLine}&limit=30&last=${lastMessageId}`);
};

export const ping = (
    baseUrl: string,
    msftConversationId: string,
    directLine: string
): any => {
    return axios.post(`${baseUrl}/api/v1/leads/ping`, {
        msft_conversation_id: msftConversationId,
        directLine
    });
};
