export interface Conversation {
    conversationId: string,
    token: string,
    eTag?: string
}

export interface Attachment {
    url: string,
    contentType: string
}

export interface Message
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

export interface MessageGroup
{
    messages: Message[],
    watermark?: string,
    eTag?: string
}
