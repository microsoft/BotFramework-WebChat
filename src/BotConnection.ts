import { Observable, BehaviorSubject } from '@reactivex/rxjs';

export interface Conversation {
    conversationId: string,
    token: string,
    eTag?: string,
    streamUrl?: string
}

export type MediaType = "image/png" | "image/jpg" | "image/jpeg" | "image/gif"

export interface Media {
    contentType: MediaType,    
    contentUrl: string,
    name?: string
}

export interface Button {
    type: "imBack" | "postBack" | "openUrl" | "signin",
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
        images?: { url: string }[],
        buttons?: Button[]
    }
} 

export interface Thumbnail {
    contentType: "application/vnd.microsoft.card.thumbnail",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        images?: { url: string }[],
        buttons?: Button[]
        tap?: string
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
        facts?: { key: string, value: string }[],
        items?: ReceiptItem[],
        tap?: string,
        tax?: string,
        VAT?: string,
        total?: string,
        buttons?: Button[]
    }
}    

export type Attachment = Media | HeroCard | Thumbnail | Signin | Receipt;  

export interface User {
    id: string,
    name?: string
}

export interface IActivity {
    type: string,
    channelData?: any,
    channelId?: string,
    conversation?: { id: string },
    eTag?: string,
    from?: User,
    id?: string,
    timestamp?: string
}

export interface Message extends IActivity {
    type: "message",
    text?: string,
    locale?: string,
    textFormat?: "plain" | "markdown" | "xml",
    attachmentLayout?: "list" | "carousel",
    attachments?: Attachment[],
    entities?: any[]
}

export interface Typing extends IActivity {
    type: "typing"
}

export type Activity = Message | Typing;

export interface IBotConnection {
    start();
    end();
    connected$: BehaviorSubject<boolean>;
    activity$: Observable<Activity>;
    postMessage: (text: string, from: User, channelData?: any) => Observable<string>,
    postFile: (file: File, from: User) => Observable<string>
}