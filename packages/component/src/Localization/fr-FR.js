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
    return "À l'instant";
  } else if (deltaInMinutes === 1) {
    return 'Il y a une minute';
  } else if (deltaInHours < 1) {
    return `Il y a ${deltaInMinutes} minutes`;
  } else if (deltaInHours === 1) {
    return `Il y a une heure`;
  } else if (deltaInHours < 5) {
    return `Il y a ${deltaInHours} heures`;
  } else if (deltaInHours <= 24) {
    return `Aujourd'hui`;
  } else if (deltaInHours <= 48) {
    return `Hier`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default {
  // FAILED_CONNECTION_NOTIFICATION: '',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: "Échec d'envoi, {Retry}.",
  // SLOW_CONNECTION_NOTIFICATION: '',
  Chat: 'Discuter',
  // 'Download file': '',
  // 'Microphone off': '',
  // 'Microphone on': '',
  Left: 'Gauche',
  'Listening…': 'Écoute…',
  'New messages': 'Nouveaux messages',
  Retry: 'Réessayer',
  Right: 'Droite',
  Send: 'Envoyer',
  Sending: 'Envoi…',
  Speak: 'Parlez',
  'Starting…': 'Démarrage…',
  Tax: 'Taxe',
  Total: 'Total',
  'Type your message': 'Saisissez votre message',
  'Upload file': 'Envoyer fichier',
  VAT: 'TVA',
  'X minutes ago': xMinutesAgo
};
