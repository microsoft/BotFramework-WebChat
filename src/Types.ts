import { Activity } from 'botframework-directlinejs';

export interface FormatOptions {
    showHeader?: boolean; // DEPRECATED: Use "title" instead
    bottomOffset?: number;
    topOffset?: number;
}

export interface ActivityOrID {
    activity?: Activity;
    id?: string;
}
