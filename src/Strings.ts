export interface Strings {
    title: string,
    send: string,
    unknownFile: string,
    unknownCard: string,
    receiptTax: string,
    receiptVat: string,
    receiptTotal: string
    messageRetry: string,
    messageFailed: string,
    messageSending: string,
    timeSent: string,
    consolePlaceholder: string,
    listeningIndicator: string
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
        receiptVat: "VAT",
        receiptTax: "Tax",
        receiptTotal: "Total",
        messageRetry: "retry",
        messageFailed: "couldn't send",
        messageSending: "sending",
        timeSent: " at %1",
        consolePlaceholder: "Type your message...",
        listeningIndicator: "Listening..."
    },
    'nb-no': {
        title: "Chat",
        send: "Send",
        unknownFile: "[Fil av typen '%1']",
        unknownCard: "[Ukjent Kort '%1']",
        receiptVat: "MVA",
        receiptTax: "Skatt",
        receiptTotal: "Totalt",
        messageRetry: "prøv igjen",
        messageFailed: "kunne ikke sende",
        messageSending: "sender",
        timeSent: " %1",
        consolePlaceholder: "Skriv inn melding...",
        listeningIndicator: "Lytter..."
    },    
    'de-de': {
        title: "Chat",
        send: "Senden",
        unknownFile: "[Datei vom Typ '%1']",
        unknownCard: "[Unbekannte Card '%1']",
        receiptVat: "VAT",
        receiptTax: "MwSt.",
        receiptTotal: "Gesamtbetrag",
        messageRetry: "wiederholen",
        messageFailed: "konnte nicht senden",
        messageSending: "sendet",
        timeSent: " am %1",
        consolePlaceholder: "Verfasse eine Nachricht...",
        listeningIndicator: "Hören..."
    },
    'pl-pl': {
        title: "Chat",
        send: "Wyślij",
        unknownFile: "[Plik typu '%1']",
        unknownCard: "[Nieznana karta '%1']",
        receiptVat: "VAT",
        receiptTax: "Podatek",
        receiptTotal: "Razem",
        messageRetry: "wyślij ponownie",
        messageFailed: "wysłanie nieudane",
        messageSending: "wysyłanie",
        timeSent: " o %1",
        consolePlaceholder: "Wpisz swoją wiadomość...",
        listeningIndicator: "Słuchający..."
    },
    'ru-ru': {
        title: "Чат",
        send: "Отправить",
        unknownFile: "[Неизвестный тип '%1']",
        unknownCard: "[Неизвестная карта '%1']",
        receiptVat: "VAT",
        receiptTax: "Налог",
        receiptTotal: "Итого",
        messageRetry: "повторить",
        messageFailed: "не удалось отправить",
        messageSending: "отправка",
        timeSent: " в %1",
        consolePlaceholder: "Введите ваше сообщение...",
        listeningIndicator: "прослушивание..."
    },
    'nl-nl': {
        title: "Chat",
        send: "Verstuur",
        unknownFile: "[Bestand van het type '%1']",
        unknownCard: "[Onbekende kaart '%1']",
        receiptVat: "VAT",
        receiptTax: "BTW",
        receiptTotal: "Totaal",
        messageRetry: "opnieuw",
        messageFailed: "versturen mislukt",
        messageSending: "versturen",
        timeSent: " om %1",
        consolePlaceholder: "Typ je bericht...",
        listeningIndicator: "het luisteren..."
    },
    'lv-lv': {
        title: "Tērzēšana",
        send: "Sūtīt",
        unknownFile: "[Nezināms tips '%1']",
        unknownCard: "[Nezināma kartīte '%1']",
        receiptVat: "VAT",
        receiptTax: "Nodoklis",
        receiptTotal: "Kopsumma",
        messageRetry: "Mēģināt vēlreiz",
        messageFailed: "Neizdevās nosūtīt",
        messageSending: "Nosūtīšana",
        timeSent: " %1",
        consolePlaceholder: "Ierakstiet savu ziņu...",
        listeningIndicator: "Klausoties..."
    },
    'pt-br': {
        title: "Bate-papo",
        send: "Enviar",
        unknownFile: "[Arquivo do tipo '%1']",
        unknownCard: "[Cartão desconhecido '%1']",
        receiptVat: "VAT",
        receiptTax: "Imposto",
        receiptTotal: "Total",
        messageRetry: "repetir",
        messageFailed: "não pude enviar",
        messageSending: "enviando",
        timeSent: " às %1",
        consolePlaceholder: "Digite sua mensagem...",
        listeningIndicator: "Ouvindo..."
    },
    'fr-fr': {
        title: "Chat",
        send: "Envoyer",
        unknownFile: "[Fichier de type '%1']",
        unknownCard: "[Carte inconnue '%1']",
        receiptVat: "TVA",
        receiptTax: "Taxe",
        receiptTotal: "Total",
        messageRetry: "reéssayer",
        messageFailed: "envoi impossible",
        messageSending: "envoi",
        timeSent: " à %1",
        consolePlaceholder: "Écrivez votre message...",
        listeningIndicator: "Écoute..."
    },
    'es-es': {
        title: "Chat",
        send: "Enviar",
        unknownFile: "[Archivo de tipo '%1']",
        unknownCard: "[Tarjeta desconocida '%1']",
        receiptVat: "IVA",
        receiptTax: "Impuestos",
        receiptTotal: "Total",
        messageRetry: "reintentar",
        messageFailed: "no enviado",
        messageSending: "enviando",
        timeSent: " a las %1",
        consolePlaceholder: "Escribe tu mensaje...",
        listeningIndicator: "Escuchando..."
    },
    'el-gr': {
        title: "Συνομιλία",
        send: "Αποστολή",
        unknownFile: "[Αρχείο τύπου '%1']",
        unknownCard: "[Αγνωστη Κάρτα '%1']",
        receiptVat: "VAT",
        receiptTax: "ΦΠΑ",
        receiptTotal: "Σύνολο",
        messageRetry: "δοκιμή",
        messageFailed: "αποτυχία",
        messageSending: "αποστολή",
        timeSent: " την %1",
        consolePlaceholder: "Πληκτρολόγηση μηνύματος...",
        listeningIndicator: "Ακούγοντας..."
    },
    'it-it': {
        title: "Chat",
        send: "Invia",
        unknownFile: "[File di tipo '%1']",
        unknownCard: "[Card sconosciuta '%1']",
        receiptVat: "VAT",
        receiptTax: "Tasse",
        receiptTotal: "Totale",
        messageRetry: "riprova",
        messageFailed: "impossibile inviare",
        messageSending: "invio",
        timeSent: " il %1",
        consolePlaceholder: "Scrivi il tuo messaggio...",
        listeningIndicator: "Ascoltando..."
    },
    'zh-hans': {
        title: "聊天",
        send: "发送",
        unknownFile: "[类型为'%1'的文件]",
        unknownCard: "[未知的'%1'卡片]",
        receiptVat: "VAT",
        receiptTax: "税",
        receiptTotal: "共计",
        messageRetry: "重试",
        messageFailed: "无法发送",
        messageSending: "正在发送",
        timeSent: " 用时 %1",
        consolePlaceholder: "输入你的消息...",
        listeningIndicator: "正在倾听..."
    },
    'zh-hant': {
        title: "聊天",
        send: "發送",
        unknownFile: "[類型為'%1'的文件]",
        unknownCard: "[未知的'%1'卡片]",
        receiptVat: "VAT",
        receiptTax: "税",
        receiptTotal: "總共",
        messageRetry: "重試",
        messageFailed: "無法發送",
        messageSending: "正在發送",
        timeSent: " 於 %1",
        consolePlaceholder: "輸入你的訊息...",
        listeningIndicator: "正在聆聽..."
    },
    'zh-yue': {
        title: "傾偈",
        send: "傳送",
        unknownFile: "[類型係'%1'嘅文件]",
        unknownCard: "[唔知'%1'係咩卡片]",
        receiptVat: "VAT",
        receiptTax: "税",
        receiptTotal: "總共",
        messageRetry: "再嚟一次",
        messageFailed: "傳送唔倒",
        messageSending: "而家傳送緊",
        timeSent: " 喺 %1",
        consolePlaceholder: "輸入你嘅訊息...",
        listeningIndicator: "聽緊你講嘢..."
    },
    'cs-cz': {
        title: "Chat",
        send: "Odeslat",
        unknownFile: "[Soubor typu '%1']",
        unknownCard: "[Neznámá karta '%1']",
        receiptVat: "DPH",
        receiptTax: "Daň z prod.",
        receiptTotal: "Celkem",
        messageRetry: "opakovat",
        messageFailed: "nepodařilo se odeslat",
        messageSending: "Odesílání",
        timeSent: " v %1",
        consolePlaceholder: "Napište svou zprávu...",
        listeningIndicator: "Poslouchám..."
    }
}

export const defaultStrings = localizedStrings['en-us'];

// Returns strings using the "best match available"" locale
// e.g. if 'en-us' is the only supported English locale, then
// strings('en') should return localizedStrings('en-us')

export const strings = (locale: string) => {
    if (locale.startsWith('de'))
        locale = 'de-de';
    else if (locale.startsWith('no') || locale.startsWith('nb') || locale.startsWith('nn'))
        locale = 'nb-no';
    else if (locale.startsWith('pl'))
        locale = 'pl-pl';
    else if (locale.startsWith('ru'))
        locale = 'ru-ru';
    else if (locale.startsWith('nl'))
        locale = 'nl-nl';
    else if (locale.startsWith('lv'))
        locale = 'lv-lv';
    else if (locale.startsWith('pt'))
        locale = 'pt-br';
    else if (locale.startsWith('fr'))
        locale = 'fr-fr';
    else if (locale.startsWith('es'))
        locale = 'es-es';
    else if (locale.startsWith('el'))
        locale = 'el-gr';
    else if (locale.startsWith('it'))
        locale = 'it-it';
    else if (locale === 'zh-yue')
        locale = 'zh-yue';
    else if (locale === 'zh-hant' || locale === 'zh-hk' || locale === 'zh-mo' || locale === 'zh-tw')
        locale = 'zh-hant';
    else if (locale.startsWith('zh'))
        locale = 'zh-hans';
    else if (locale.startsWith('cs'))
        locale = 'cs-cz';
    else
        locale = 'en-us';

    return localizedStrings[locale];
}
