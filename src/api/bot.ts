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

export const conversationHistory = (
    baseUrl: string,
    directLine: string,
    conversationId: string
): any => {
    return axios.get(`${baseUrl}/api/v1/conversations/history?conversation_id=${conversationId}&directLine=${directLine}&limit=30`);
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

export const availableTimes = (
    baseUrl: string,
    directLine: string,
    conversationId: string,
    startDate: string,
    endDate: string
): any => {
    return axios.get(`${baseUrl}/api/v1/availabilities/available_times?directLine=${directLine}&conversation_id=${conversationId}&start_date=${startDate}&end_date=${endDate}`);
};
