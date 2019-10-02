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
    return 'jetzt';
  } else if (deltaInMinutes === 1) {
    return 'Vor einer Minute';
  } else if (deltaInHours < 1) {
    return `Vor ${deltaInMinutes} Minuten`;
  } else if (deltaInHours === 1) {
    return `Vor eine Stunde`;
  } else if (deltaInHours < 5) {
    return `Vor ${deltaInHours} Stunden`;
  } else if (deltaInHours <= 24) {
    return `heute`;
  } else if (deltaInHours <= 48) {
    return `gestern`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('de-DE').format(date);
  }

  return date.toLocaleString('de-DE', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'Keine Verbindung',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `konnte nicht senden, {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Eingeschränkte Konnektivität',
  Chat: 'Chat',
  'Download file': 'Datei herunterladen',
  'Microphone off': 'Mikrofon aus',
  'Microphone on': 'Mikrofon aus',
  Left: 'Links',
  'Listening…': 'hört zu…',
  'New messages': 'Neue Nachrichten',
  Retry: 'Wiederholen',
  Right: 'Rechts',
  Send: 'Senden',
  Sending: 'sendet…',
  Speak: 'Sprechen',
  'Starting…': 'Startet…',
  Tax: 'Steuer',
  Total: 'Total',
  'Type your message': 'Verfasse eine Nachricht',
  'Upload file': 'Datei hochladen',
  VAT: 'MwSt',
  'X minutes ago': xMinutesAgo
};
