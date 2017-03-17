// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Bot Framework: http://botframework.com
// 
// Bot Builder SDK Github:
// https://github.com/Microsoft/BotBuilder
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

export interface ErrorCallback { (err?: Error): void; }

export interface IEvent {
    type: string;
    agent: string;
    source: string;
    sourceEvent: any;
    address: IAddress;
    user: IIdentity;
}

export interface IMessage extends IEvent {
    timestamp: string;              // Timestamp of message given by chat service 
    summary: string;                // Text to be displayed by as fall-back and as short description of the message content in e.g. list of recent conversations 
    text: string;                   // Message text  
    textLocale: string;             // Identified language of the message text.
    attachments: IAttachment[];     // This is placeholder for structured objects attached to this message 
    entities: any[];                // This property is intended to keep structured data objects intended for Client application e.g.: Contacts, Reservation, Booking, Tickets. Structure of these object objects should be known to Client application.
    textFormat: string;             // Format of text fields [plain|markdown|xml] default:markdown
    attachmentLayout: string;       // AttachmentLayout - hint for how to deal with multiple attachments Values: [list|carousel] default:list
}

export interface IIsMessage {
    toMessage(): IMessage;
}

export interface IIdentity {
    id: string;                     // Channel specific ID for this identity
    name?: string;                  // Friendly name for this identity
    isGroup?: boolean;              // If true the identity is a group.  
}

export interface IAddress {
    channelId: string;              // Unique identifier for channel
    user: IIdentity;                // User that sent or should receive the message
    bot?: IIdentity;                // Bot that either received or is sending the message
    conversation?: IIdentity;       // Represents the current conversation and tracks where replies should be routed to. 
}

export interface IAttachment {
    contentType: string;            // MIME type string which describes type of attachment 
    content?: any;                  // (Optional) object structure of attachment 
    contentUrl?: string;            // (Optional) reference to location of attachment content
}

export interface IIsAttachment {
    toAttachment(): IAttachment;
}

export interface ISigninCard {
    text: string;                   // Title of the Card 
    buttons: ICardAction[];         // Sign in action 
}

export interface IKeyboard {
    buttons: ICardAction[];         // Set of actions applicable to the current card. 
}

export interface IThumbnailCard extends IKeyboard {
    title: string;                  // Title of the Card 
    subtitle: string;               // Subtitle appears just below Title field, differs from Title in font styling only 
    text: string;                   // Text field appears just below subtitle, differs from Subtitle in font styling only 
    images: ICardImage[];           // Messaging supports all media formats: audio, video, images and thumbnails as well to optimize content download. 
    tap: ICardAction;               // This action will be activated when user taps on the section bubble. 
}

export interface IMediaCard extends IKeyboard{
    title: string;                  // Title of the Card 
    subtitle: string;               // Subtitle appears just below Title field, differs from Title in font styling only 
    text: string;                   // Text field appears just below subtitle, differs from Subtitle in font styling only 
    image: ICardImage;              // Messaging supports all media formats: audio, video, images and thumbnails as well to optimize content download.
    media: ICardMediaUrl[];         // Media source for video, audio or animations
    autoloop: boolean;              // Should the media source reproduction run in a lool
    autostart: boolean;             // Should the media start automatically
    shareable: boolean;             // Should media be shareable
}

export interface IAnimationMediaCard{
    title: string;                  // Title of the Card 
    subtitle: string;               // Subtitle appears just below Title field, differs from Title in font styling only 
    text: string;                   // Text field appears just below subtitle, differs from Subtitle in font styling only 
    image?: ICardImage;              // Messaging supports all media formats: audio, video, images and thumbnails as well to optimize content download.
    media: ICardMediaUrl[];         // Media source for video, audio or animations
    autoloop: boolean;              // Should the media source reproduction run in a lool
    autostart: boolean;             // Should the media start automatically
    shareable: boolean;             // Should media be shareable
    buttons?: ICardAction[];         // Set of actions applicable to the current card.
}

export interface IVideoCard extends IMediaCard {
    aspect: string;                 //Hint of the aspect ratio of the video or animation. (16:9)(4:3)
}

export interface IAnimationCard extends IMediaCard {
}

export interface IAudioCard extends IMediaCard {
}

export interface IIsCardMedia{
    toMedia(): ICardMediaUrl;      //Returns the media to serialize
}

export interface ICardMediaUrl {
    url: string,                    // Url to audio, video or animation media
    profile: string                 // Optional profile hint to the client to differentiate multiple MediaUrl objects from each other
}

export interface IReceiptCard {
    title: string;                  // Title of the Card 
    items: IReceiptItem[];          // Array of receipt items.
    facts: IFact[];                 // Array of key-value pairs. 
    tap: ICardAction;                   // This action will be activated when user taps on the section bubble. 
    total: string;                  // Total amount of money paid (or should be paid) 
    tax: string;                    // Total amount of TAX paid (or should be paid) 
    vat: string;                    // Total amount of VAT paid (or should be paid) 
    buttons: ICardAction[];             // Set of actions applicable to the current card. 
}

export interface IReceiptItem {
    title: string;                  // Title of the Card 
    subtitle: string;               // Subtitle appears just below Title field, differs from Title in font styling only 
    text: string;                   // Text field appears just below subtitle, differs from Subtitle in font styling only 
    image: ICardImage;
    price: string;                  // Amount with currency 
    quantity: string;               // Number of items of given kind 
    tap: ICardAction;                   // This action will be activated when user taps on the Item bubble. 
}

export interface IIsReceiptItem {
    toItem(): IReceiptItem;
}

export interface ICardAction {
    type: string;                   // Defines the type of action implemented by this button.  
    title: string;                  // Text description which appear on the button. 
    value: string;                  // Parameter for Action. Content of this property depends on Action type. 
    image?: string;                 // (Optional) Picture which will appear on the button, next to text label. 
}

export interface IIsCardAction {
    toAction(): ICardAction;
}

export interface ICardImage {
    url: string;                    // Thumbnail image for major content property. 
    alt: string;                    // Image description intended for screen readers 
    tap: ICardAction;                   // Action assigned to specific Attachment. E.g. navigate to specific URL or play/open media content 
}

export interface IIsCardImage {
    toImage(): ICardImage;
}

export interface IFact {
    key: string;                    // Name of parameter 
    value: string;                  // Value of parameter 
}

export interface IIsFact {
    toFact(): IFact;
}

export interface IRating {
    score: number;                  // Score is a floating point number. 
    max: number;                    // Defines maximum score (e.g. 5, 10 or etc). This is mandatory property. 
    text: string;                   // Text to be displayed next to score. 
}

export interface ILocationV2 {
    altitude?: number;
    latitude: number;
    longitude: number;
}

export interface ILocalizer {
    load(locale: string, callback?: ErrorCallback): void;     
    defaultLocale(locale?: string): string   
    gettext(locale: string, msgid: string, namespace?: string): string;
    trygettext(locale: string, msgid: string, namespace?: string): string;
    ngettext(locale: string, msgid: string, msgid_plural: string, count: number, namespace?: string): string;
}

export interface IDefaultLocalizerSettings {
    botLocalePath?: string;
    defaultLocale?: string;
}

export interface ISessionState {
    callstack: IDialogState[];
    lastAccess: number;
    version: number;
}

export interface IDialogState {
    id: string;
    state: any;
}

export interface IIntent {
    intent: string;
    score: number;
}

export interface IEntity {
    entity: string;
    type: string;
    startIndex?: number;
    endIndex?: number;
    score?: number;
}
