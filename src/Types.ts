import { Activity } from 'botframework-directlinejs';

export interface FormatOptions {
    showHeader?: boolean; // DEPRECATED: Use "title" instead
}

export interface ActivityOrID {
    activity?: Activity;
    id?: string;
}
