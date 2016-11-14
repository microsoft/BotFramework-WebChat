export interface Strings {
    title: string,
    send: string,
    unknownFile: string
}

interface LocalizedStrings {
    [locale: string]: Strings
}

const localizedStrings: LocalizedStrings = {
    'en-us': {
        title: "Chat",
        send: "Send",
        unknownFile: "[File of type '%1']"
    }
}

// Returns strings using the "best match available"" locale
// e.g. if 'en-us' is the only supported English locale, then
// strings('en') should return localizedStrings('en-us')
export const strings = (locale: string) => {
    return localizedStrings['en-us'];
}