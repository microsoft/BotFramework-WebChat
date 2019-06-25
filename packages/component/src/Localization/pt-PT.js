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
    return 'Agora mesmo';
  } else if (deltaInMinutes === 1) {
    return 'Um minuto atrás';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} minutos atrás`;
  } else if (deltaInHours === 1) {
    return `Uma hora atrás`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} horas atrás`;
  } else if (deltaInHours <= 24) {
    return `Hoje`;
  } else if (deltaInHours <= 48) {
    return `Ontem`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('pt-PT').format(date);
  }

  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function botSaidSomething(avatarInitials, text) {
  return `Bot ${avatarInitials} disse, ${text}`;
}

function userSaidSomething(avatarInitials, text) {
  return `User ${avatarInitials} disse, ${text}`;
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'Não foi possível ligar.',
  INITIAL_CONNECTION_NOTIFICATION: 'A ligar…',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'Interrupção de Rede. Reconectando…',
  RENDER_ERROR_NOTIFICATION:
    'Ocorreu um erro a renderizar. Por favor verifique a consola ou contacte o developer do bot.',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: 'O envio falhou. {Retry}.',
  SLOW_CONNECTION_NOTIFICATION: 'A ligação está a demorar mais tempo que o normal',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  // '[File of type '%1']': '[File of type '%1']",
  // '[Unknown Card '%1']': '[Unknown Card '%1']',
  'Adaptive Card parse error': 'Erro ao fazer parse do Adaptive Card',
  'Adaptive Card render error': 'Erro ao renderizar o Adaptive Card',
  Chat: 'Chat',
  'Download file': 'Descarregar ficheiro',
  Left: 'Esquerda',
  'Listening…': 'A escutar…',
  'Microphone off': 'Desligar microfone',
  'Microphone on': 'Ligar microfone',
  'New messages': 'Novas mensagens',
  Retry: 'Tentar novamente',
  Right: 'Direita',
  Send: 'Enviar',
  Sending: 'A enviar',
  Speak: 'Falar',
  'Starting…': 'A iniciar…',
  Tax: 'Imposto',
  Total: 'Total',
  'Type your message': 'Escreva a sua mensagem',
  'Upload file': 'Enviar ficheiro',
  VAT: 'IVA'
};
