export interface BotConversation {
    conversationId: string,
    token: string,
    eTag?: string
}

export interface BotAttachment {
    url: string,
    contentType: string
}

export interface BotMessage
{
    id?: string,
    conversationId: string,
    created?: string,
    from?: string,
    text?: string,
    channelData?: string,
    images?: string[],
    attachments?: BotAttachment[];
    eTag?: string;
}

export interface BotMessageGroup
{
    messages: BotMessage[],
    watermark?: string,
    eTag?: string
}
