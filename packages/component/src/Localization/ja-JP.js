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
    return 'たった今';
  } else if (deltaInHours < 1) {
    return `${ deltaInMinutes } 分前`;
  } else if (deltaInHours < 5) {
    return `${ deltaInHours } 時間前`;
  } else if (deltaInHours <= 24) {
    return '今日';
  } else if (deltaInHours <= 48) {
    return '昨日';
  } else {
    return new Intl.DateTimeFormat('ja-JP').format(date);
  }
}

export default {
  'Chat': 'チャット',
  'Download file': 'ダウンロード',
  'Microphone off': 'マイクオン',
  'Microphone on': 'マイクオフ',
  'Listening': '聴いてます',
  'retry': '再送',
  'Retry': '{retry}', // Please alter this value if 'Retry' at the beginning of a sentence is written differently than at the end of a sentence.
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: '送信できませんでした。{Retry}。',
  'Sending': '送信中',
  'Tax': '税',
  'Type your message': 'メッセージを入力してください',
  'Total': '合計',
  'VAT': '消費税',
  'Send': '送信',
  'X minutes ago': xMinutesAgo
}
