export interface Strings {
    title: string,
    send: string,
    unknownFile: string,
    unknownCard: string,
    receiptTax: string,
    receiptTotal: string
    messageRetry: string,
    messageFailed: string,
    messageSending: string,
    timeSent: string,
    consolePlaceholder: string
}

interface LocalizedStrings {
    [locale: string]: Strings
}

const localizedStrings: LocalizedStrings = {
    'en-us': {
        title: "Chat",
        send: "Send",
        unknownFile: "[File of type '%1']",
        unknownCard: "[Unknown Card '%1']",
        receiptTax: "Tax",
        receiptTotal: "Total",
        messageRetry: "retry",
        messageFailed: "couldn't send",
        messageSending: "sending",
        timeSent: " at %1",
        consolePlaceholder: "Type your message..."
    },
    'de-de': {
        title: "Chat",
        send: "Senden",
        unknownFile: "[Datei vom Typ '%1']",
        unknownCard: "[Unbekannte Card '%1']",
        receiptTax: "MwSt.",
        receiptTotal: "Gesamtbetrag",
        messageRetry: "wiederholen",
        messageFailed: "konnte nicht senden",
        messageSending: "sendet",
        timeSent: " am %1",
        consolePlaceholder: "Verfasse eine Nachricht..."
    }
}

// Returns strings using the "best match available"" locale
// e.g. if 'en-us' is the only supported English locale, then
// strings('en') should return localizedStrings('en-us')
export const strings = (locale: string) => {
    
    if(locale=="de" || locale=="de-de" || locale=="de-ch")
    {
        return localizedStrings['de-de'];
    }
    return localizedStrings['en-us'];
}