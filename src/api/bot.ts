import axios from 'axios';
import { Activity } from 'botframework-directlinejs';

export const verifyConversation = (
    baseUrl: string,
    msftConversationId: string,
    msftUserId: string,
    directLine: string,
    originatingUrl: string,
    campaignParams: object
): any => {
    return axios.post(`${baseUrl}/api/v1/bot/conversations`, {
        msft_conversation_id: msftConversationId,
        originating_url: originatingUrl,
        msft_user_id: msftUserId,
        directLine,
        campaignParams
    });
};

export const newConversation = (
    baseUrl: string,
    botId: string,
    msftConversationId: string,
    msftUserId: string,
    organizationId: string,
    directLine: string,
    originatingUrl: string
): any => {
    return axios.post(`${baseUrl}/api/v1/bot/new_conversation`, {
        bot_id: botId,
        msft_conversation_id: msftConversationId,
        msft_user_id: msftUserId,
        organization_id: organizationId,
        directLine,
        originating_url: originatingUrl
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

export const availableTimes = (
    baseUrl: string,
    directLine: string,
    conversationId: string,
    startDate: string
): any => {
    return axios.get(`${baseUrl}/api/v1/availabilities/available_times?directLine=${directLine}&conversation_id=${conversationId}&start_date=${startDate}`);
};

export const getPastConversations = (baseUrl: string, userId: string, directLine: string): any => {
    return axios.get(`${baseUrl}/api/v1/bot/past_conversations?msft_user_id=${userId}&directLine=${directLine}`);
};

export const mapMessagesToActivities = (messages: any, userId: any): Activity[] => {
    return messages.map((m: any, i: number) => {
        return {
            id: m.id,
            type: 'message',
            entities: m.entities,
            suggestedActions: m.suggestedActions,
            from: {
                id: m.sender_type === 'bot' ? '' : userId
            },
            text: m.message
        };
    });
};
