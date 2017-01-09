import { Observable, BehaviorSubject } from 'rxjs';

export interface Conversation {
    conversationId: string,
    token: string,
    eTag?: string,
    streamUrl?: string
}

export type MediaType = "image/png" | "image/jpg" | "image/jpeg" | "image/gif" | "audio/mpeg" | "audio/mp4" | "video/mp4"

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

// only supported for 'skype' channel.
export interface FlexCard {
    contentType: "application/vnd.microsoft.card.flex",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        images?: { 
            url: string,
            tap?: Button 
        }[],
        buttons?: Button[],
        aspect?: string
    }
}  

export interface AudioCard {
    contentType: "application/vnd.microsoft.card.audio",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        media?: { url: string, profile?: string }[],
        buttons?: Button[],
        autoloop?: boolean,
        autostart?: boolean
    }
}

export interface VideoCard {
    contentType: "application/vnd.microsoft.card.video",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        media?: { url: string, profile?: string }[],
        buttons?: Button[],
        image?: { url: string, alt?: string },
        autoloop?: boolean,
        autostart?: boolean
    }
}

export interface AnimationCard {
    contentType: "application/vnd.microsoft.card.animation",
    content: {
        title?: string,
        subtitle?: string,
        text?: string,
        media?: { url: string, profile?: string }[],
        buttons?: Button[],
        image?: { url: string, alt?: string },
        autoloop?: boolean,
        autostart?: boolean
    }
}

export type Attachment = Media | HeroCard | Thumbnail | Signin | Receipt | AudioCard | VideoCard | AnimationCard | FlexCard;

export interface User {
    id: string,
    name?: string,
    iconUrl?: string
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

export type AttachmentLayout = "list" | "carousel";

export interface Message extends IActivity {
    type: "message",
    text?: string,
    locale?: string,
    textFormat?: "plain" | "markdown" | "xml",
    attachmentLayout?: AttachmentLayout,
    attachments?: Attachment[],
    entities?: any[]
}

export interface Typing extends IActivity {
    type: "typing"
}

export type Activity = Message | Typing;

export enum ConnectionStatus {
    Uninitialized,              // the status when DirectLine object when first created/constructed
    Connecting,                 // currently trying to connect to the conversation
    Online,                     // successfully connected to the converstaion. Connection is healthy so far as we know.
    ExpiredToken,               // last operation errored out with an expired token. Possibly waiting for someone to supply a new one.
    FailedToConnect,            // the initial attempt to connect to the conversation failed. No recovery possible.
    Ended                       // the bot ended the conversation
} 

export interface IBotConnection {
    connectionStatus$: BehaviorSubject<ConnectionStatus>,
    activity$: Observable<Activity>,
    end(): void,
    postActivity(activity: Activity): Observable<string>
}
