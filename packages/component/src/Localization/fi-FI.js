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
    return 'Juuri nyt';
  } else if (deltaInMinutes === 1) {
    return 'Minuutti sitten';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} minuuttia sitten`;
  } else if (deltaInHours === 1) {
    return `Tunti sitten`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} tuntia sitten`;
  } else if (deltaInHours <= 24) {
    return `Tänään`;
  } else if (deltaInHours <= 48) {
    return `Eilen`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('fi-FI').format(date);
  }

  return date.toLocaleString('fi-FI', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function botSaidSomething(avatarInitials, text) {
  return `Botti ${avatarInitials} sanoi, ${text}`;
}

function downloadFileWithFileSize(downloadFileText, fileName, size) {
  // Full text should read: "Download file <filename> of size <filesize>"
  return `Lataa tiedosto ${fileName}, koko: ${size}`;
}

function uploadFileWithFileSize(uploadFileText, fileName, size) {
  return `${fileName}, koko: ${size}`;
}

function userSaidSomething(avatarInitials, text) {
  return `Käyttäjä ${avatarInitials} sanoi, ${text}`;
}

export default {
  CONNECTED_NOTIFICATION: 'Yhdistetty',
  FAILED_CONNECTION_NOTIFICATION: 'Ei voitu yhdistää.',
  INITIAL_CONNECTION_NOTIFICATION: 'Yhdistää…',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'Yhteys palvelimeen keskeytyi. Yhdistää uudelleen…',
  RENDER_ERROR_NOTIFICATION: 'Renderöintivirhe. Ole hyvä ja katso konsolia tai ota yhteys botin kehittäjään.',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `Lähetys epäonnistui, {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Yhteyden muodostaminen kestää kauemmin kuin yleensä.',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  // The following two errors make more sence in English than Finnish
  'Adaptive Card parse error': 'Adaptive Card parse error',
  'Adaptive Card render error': 'Adaptive Card render error',
  BotSent: 'Botti lähetti: ',
  Chat: 'Chat',
  'Download file': 'Lataa tiedosto',
  DownloadFileWithFileSize: downloadFileWithFileSize,
  ErrorMessage: 'Virheviesti',
  'Microphone off': 'Mikrofoni pois päältä',
  'Microphone on': 'Mikrofoni päällä',
  Left: 'Vasen',
  'Listening…': 'Kuuntelee…',
  'New messages': 'Uusia viestejä',
  Retry: 'yritä uudelleen',
  Right: 'Oikea',
  Send: 'Lähetä',
  SendBox: 'Sendbox',
  Sending: 'Lähettää…',
  SendStatus: 'Lähetyksen tila: ',
  SentAt: 'Lähetetty: ',
  Speak: 'Puhu',
  'Starting…': 'Aloittaa…',
  Tax: 'Vero',
  Total: 'Yhteensä',
  'Type your message': 'Kirjoita viesti',
  TypingIndicator: 'Kirjoitusindikaattori näkyy',
  'Upload file': 'Lataa tiedosto',
  UploadFileWithFileSize: uploadFileWithFileSize,
  UserSent: 'Käyttäjä lähetti: ',
  VAT: 'ALV'
};
