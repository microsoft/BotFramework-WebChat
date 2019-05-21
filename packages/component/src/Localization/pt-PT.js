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
        return 'Agora';
    } else if (deltaInMinutes === 1) {
        return 'Há um minuto';
    } else if (deltaInHours < 1) {
        return `Há ${deltaInMinutes} minutos`;
    } else if (deltaInHours === 1) {
        return `Há uma hora atrás`;
    } else if (deltaInHours < 5) {
        return `Há ${deltaInHours} horas`;
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
        year: 'numeric',
    });
}

function botSaidSomething(avatarInitials, text, timestamp) {
    return `Bot ${avatarInitials} said, ${text}, ${xMinutesAgo(timestamp)}`;
}

function userSaidSomething(avatarInitials, text, timestamp) {
    return `User ${avatarInitials} said, ${text}, ${xMinutesAgo(timestamp)}`;
}

export default {
    FAILED_CONNECTION_NOTIFICATION: 'Não foi possível conectar.',
    INITIAL_CONNECTION_NOTIFICATION: 'Conectando...',
    INTERRUPTED_CONNECTION_NOTIFICATION: 'Interrupção de Rede. Reconectando...',
    // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
    RENDER_ERROR_NOTIFICATION: 'Ocorreu um erro a renderizar. Por favor verifique a console ou contacte o developer do bot.',
    SEND_FAILED_KEY: 'Envio falhou. {Retry}.',
    SLOW_CONNECTION_NOTIFICATION: 'Está a demorar mais tempo que o habitual a conectar',
    'Bot said something': botSaidSomething,
    'User said something': userSaidSomething,
    'X minutes ago': xMinutesAgo,
    // '[File of type '%1']': '[File of type '%1']",
    // '[Unknown Card '%1']': '[Unknown Card '%1']',
    'Adaptive Card parse error': 'Adaptive Card parse error',
    'Adaptive Card render error': 'Adaptive Card render error',
    'Chat': 'Chat',
    'Download file': 'Descarregar ficheiro',
    'Microphone off': 'Desligar microfone',
    'Microphone on': 'Ligar microfone',
    'Left': 'Esquerda',
    'Listening…': 'Ouvindo...',
    'New messages': 'Novas mensagens',
    'Right': 'Direita',
    'retry': 'tentar novamente',
    'Retry': 'Tentar novamente',
    'Send': 'Enviar',
    'Sending': 'Enviando',
    'Speak': 'Falar',
    'Starting…': 'Começando...',
    'Tax': 'Tax',
    'Total': 'Total',
    'Type your message': 'Escreva a sua mensagem',
    'Upload file': 'Enviar ficheiro',
    'VAT': 'IVA'
}
