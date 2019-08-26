/* eslint no-magic-numbers: ["error", { "ignore": [1, 5, 24, 48, 60000, 3600000] }] */

function xMinutesAgo(dateStr) {
  const date = new Date(dateStr);
  const dateTime = date.getTime();

  if (isNaN(dateTime)) {
    return dateStr;
  }

  const now = Date.now();
  const deltaInMs = now - dateTime;
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return 'Adesso';
  } else if (deltaInMinutes === 1) {
    return 'Un minuto fa';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} minuti fa`;
  } else if (deltaInHours === 1) {
    return `Un ora fa`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} ore fa`;
  } else if (deltaInHours <= 24) {
    return `Oggi`;
  } else if (deltaInHours <= 48) {
    return `Ieri`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('it-IT').format(date);
  }

  return date.toLocaleString('it-IT', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function botSaidSomething(avatarInitials, text) {
  return `Il Bot ${avatarInitials} ha detto, ${text}`;
}

function downloadFileWithFileSize(downloadFileText, fileName, size) {
  // Full text should read: "Download file <filename> of size <filesize>"
  return `${downloadFileText} ${fileName} di dimensione ${size}`;
}

function uploadFileWithFileSize(fileName, size) {
  return `${fileName} di dimensione ${size}`;
}

function userSaidSomething(avatarInitials, text) {
  return `L'utente ${avatarInitials} ha detto, ${text}`;
}

export default {
  CONNECTED_NOTIFICATION: 'Connesso',
  FAILED_CONNECTION_NOTIFICATION: 'Impossibile connettersi.',
  INITIAL_CONNECTION_NOTIFICATION: 'In connessione…',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'La connessione è stata interrotta. Riconnessione…',
  RENDER_ERROR_NOTIFICATION: 'Errore di visualizzazione. Contatta lo sviluppatore del bot.',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `Impossibile inviare, {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Il Bot sta impiegando più tempo del solito per connettersi.',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  'Adaptive Card parse error': 'Adaptive Card, errore di interpretazione',
  'Adaptive Card render error': 'Adaptive Card, errore di visualizzazione',
  BotSent: 'Il Bot ha inviato: ',
  Chat: 'Chat',
  'Download file': 'Download file',
  DownloadFileWithFileSize: downloadFileWithFileSize,
  ErrorMessage: 'Messaggio di errore',
  'Microphone off': 'Microfono spento',
  'Microphone on': 'Microfono acceso',
  Left: 'Sinistra',
  'Listening…': 'Ascoltando…',
  'New messages': 'Nuovi messaggi',
  Retry: 'Riprova',
  Right: 'Destra',
  Send: 'Invia',
  Sending: 'invio',
  SendStatus: 'Stato di invio: ',
  SentAt: 'Inviato a: ',
  Speak: 'Parla',
  'Starting…': 'Inizializzando…',
  Tax: 'Tasse',
  Total: 'Totale',
  'Type your message': 'Scrivi il tuo messaggio',
  'Upload file': 'Carica un file',
  UploadFileWithFileSize: uploadFileWithFileSize,
  VAT: 'IVA'
};
