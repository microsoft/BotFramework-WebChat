/* eslint no-magic-numbers: ["error", { "ignore": [1, 5, 24, 48, 60000, 3600000] }] */

import getLocaleString from './getLocaleString';

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
    return 'Сега';
  } else if (deltaInMinutes === 1) {
    return 'Преди минута';
  } else if (deltaInHours < 1) {
    return `Преди ${deltaInMinutes} минути`;
  } else if (deltaInHours === 1) {
    return `Преди час`;
  } else if (deltaInHours < 5) {
    return `Преди ${deltaInHours} часа`;
  } else if (deltaInHours <= 24) {
    return `Днес`;
  } else if (deltaInHours <= 48) {
    return `Вчера`;
  }
  return getLocaleString(date, 'bg-BG');
}

function botSaidSomething(avatarInitials, text) {
  return `${avatarInitials} каза, ${text}`;
}

function downloadFileWithFileSize(downloadFileText, fileName, size) {
  // Full text should read: "Download file <filename> of size <filesize>"
  return `${downloadFileText} ${fileName} с размер ${size}`;
}

function uploadFileWithFileSize(fileName, size) {
  return `${fileName} с рамер ${size}`;
}

function userSaidSomething(avatarInitials, text) {
  return `${avatarInitials} каза, ${text}`;
}

export default {
  CONNECTED_NOTIFICATION: 'Свързан',
  FAILED_CONNECTION_NOTIFICATION: 'Не може да се свърже.',
  INITIAL_CONNECTION_NOTIFICATION: 'Свързване…',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'Прекъсване на мрежата. Повторно свързване…',
  RENDER_ERROR_NOTIFICATION: 'Грешка при изобразяване. Проверете конзолата или се свържете с разработчика.',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `Неуспешно изпращане. {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Свързването отнема необикновено дълго време.',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  // '[File of type '%1']': '[File of type '%1']",
  // '[Unknown Card '%1']': '[Unknown Card '%1']',
  'Adaptive Card parse error': 'Грешка при обработка на адаптивна картичка',
  'Adaptive Card render error': 'Грешка при показване на адаптивна картичка',
  BotSent: 'Изпрати: ',
  Chat: 'Разговор',
  'Download file': 'Сваляне на файл',
  DownloadFileWithFileSize: downloadFileWithFileSize,
  ErrorMessage: 'Съобщение за грешка',
  'Microphone off': 'Микрофон изключен',
  'Microphone on': 'Микрофон включен',
  Left: 'Ляво',
  'Listening…': 'Слушане…',
  'New messages': 'Ново съобщение',
  Retry: 'Отново',
  Right: 'Дясно',
  Send: 'Изпрати',
  Sending: 'Изпращане',
  SendStatus: 'Статус: ',
  SentAt: 'Изпратено на: ',
  Speak: 'Говор',
  'Starting…': 'Стартиране…',
  Tax: 'Данък',
  Total: 'Общо',
  'Type your message': 'Въведете вашето съобщение',
  TypingIndicator: 'Показване на индикатор за писане',
  'Upload file': 'Прикачване на файл',
  UploadFileWithFileSize: uploadFileWithFileSize,
  UserSent: 'Потребителят изпрати: ',
  VAT: 'ДДС'
};
