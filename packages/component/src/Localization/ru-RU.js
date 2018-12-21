function xMinutesAgo(date) {
  const now = Date.now();
  const deltaInMs = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return 'Сейчас';
  } else if (deltaInMinutes === 1) {
    return 'Минуту назад';
  } else if (deltaInHours < 1 && deltaInMinutes < 5) {
    return `${ deltaInMinutes } минуты назад`;
  } else if (deltaInHours < 1 && deltaInMinutes >= 5) {
    return `${ deltaInMinutes } минут назад`;
  } else if (deltaInHours === 1) {
    return 'Час назад';
  } else if (deltaInHours < 5) {
    return `${ deltaInHours } часа назад`;
  } else if (deltaInHours <= 24) {
    return 'Сегодня';
  } else if (deltaInHours <= 48) {
    return 'Вчера';
  } else if (deltaInHours <= 72) {
    return 'Позавчера';
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('ru-RU').format(date);
  } else {
    return date.toLocaleString(
      'ru-RU',
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }
}

export default {
  'Adaptive Card parse error': 'Ошибка парсинга адаптивной карты',
  'Adaptive Card render error': 'Ошибка отображения адаптивной карты',
  'Chat': 'Чат',
  // 'Download file': '',
  // 'Microphone off': '',
  // 'Microphone on': '',
  'Listening…': 'Прослушивание…',
  'retry': 'повторить',
  'Send failed, {retry}': 'Не удалось отправить, {retry}',
  'Send': 'Отправить',
  'Sending': 'Отправка',
  // 'Speak': '',
  'Starting…': 'Запуск…',
  'Tax': 'Налог',
  'Total': 'Итого',
  'Type your message': 'Введите ваше сообщение',
  'Upload file': 'Загрузить файл',
  'VAT': 'НДС',
  'New messages': 'Новые сообщения',
  'X minutes ago': xMinutesAgo
}
