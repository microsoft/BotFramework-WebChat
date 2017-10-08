import { Activity } from '@botique/botframework-directlinejs';

export interface FormatOptions {
    showHeader?: boolean
}

export type ActivityOrID = {
    activity?: Activity
    id?: string
}
