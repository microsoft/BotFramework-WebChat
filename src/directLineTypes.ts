export interface Conversation {
    conversationId: string,
    token: string,
    eTag?: string,
    streamUrl?: string
}

export interface Image {
    contentType: "image/png" | "image/jpg" | "image/jpeg",    
    contentUrl: string,
    name?: string
}

export interface Button {
    type: "imBack" | "postBack" | "openUrl",
    title: string,
    value: string
    image?: string,
}

export interface HeroCard {
    contentType: "application/vnd.microsoft.card.hero",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        images?: {url: string}[],
        buttons?: Button[]
    }
} 

export interface Thumbnail {
    contentType: "application/vnd.microsoft.card.thumbnail",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        images?: {url: string}[],
        buttons?: Button[]
        tap: string
    }
}

export interface Signin {
    contentType: "application/vnd.microsoft.card.signin",
    content: {
        text?: string,
        buttons?: Button[]
    }
}

export interface ReceiptItem {
    title?: string,
    subtitle?: string,
    text?: string,
    image?: { url: string },
    price?: string,
    quantity?: string,
    tap?: string
}

export interface Receipt {
    contentType: "application/vnd.microsoft.card.receipt",
    content: {
        title?: string,
        facts?: {key: string, value: string}[],
        items?: ReceiptItem[],
        tap?: string,
        tax?: string,
        VAT?: string,
        total?: string,
        buttons?: Button[]
    }
}    

export type Attachment = Image | HeroCard | Thumbnail | Signin | Receipt;  

export interface Message
{
    type: "message",
    id?: string,
    conversation?: {id: string},
    timestamp?: string,
    from?: {id: string},
    text?: string,
    local?: string,
    textFormat?: "plain" | "markdown" | "xml",
    channelData?: any,
    attachmentLayout?: "list" | "carousel",
    attachments?: Attachment[],
    eTag?: string,
    channelId?: string,
    entities?: any[]
}

export interface Typing {
    type: "typing"
}

export type Activity = Message | Typing;
