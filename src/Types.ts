import { Activity } from 'botframework-directlinejs';

export interface FormatOptions {
    showHeader?: boolean
    title?: string
}

export type ActivityOrID = {
    activity?: Activity
    id?: string
}
