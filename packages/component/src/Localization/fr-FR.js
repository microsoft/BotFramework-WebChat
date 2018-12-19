function xMinutesAgo(date) {
  const now = Date.now();
  const deltaInMs = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return "À l'instant";
  } else if (deltaInMinutes === 1) {
    return 'Il y a une minute';
  } else if (deltaInHours < 1) {
    return `Il y a ${ deltaInMinutes } minutes`;
  } else if (deltaInHours === 1) {
    return `Il y a une heure`;
  } else if (deltaInHours < 5) {
    return `Il y a ${ deltaInHours } heures`;
  } else if (deltaInHours <= 24) {
    return `Aujourd'hui`;
  } else if (deltaInHours <= 48) {
    return `Hier`;
  } else {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }
}

export default {
  'Chat': 'Discuter',
  // 'Download file': '',
  // 'Microphone off': '',
  // 'Microphone on': '',
  'Left': 'Gauche',
  'Listening…': 'Écoute…',
  'New messages': 'Nouveaux messages',
  'retry': 'Réessayer',
  'Right': 'Droite',
  'Send failed, {retry}': 'Échec d\'envoi, {retry}',
  'Send': 'Envoyer',
  'Sending': 'Envoi…',
  'Speak': 'Parlez',
  'Starting…': 'Démarrage…',
  'Tax': 'Taxe',
  'Total': 'Total',
  'Type your message': 'Saisissez votre message',
  'Upload file': 'Envoyer fichier',
  'VAT': 'TVA',
  'X minutes ago': xMinutesAgo
}