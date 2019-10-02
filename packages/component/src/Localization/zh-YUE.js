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
    return '啱啱';
  } else if (deltaInMinutes === 1) {
    return '一分鐘前';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} 分鐘前`;
  } else if (deltaInHours === 1) {
    return `一個鐘前`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} 個鐘前`;
  } else if (deltaInHours <= 24) {
    return `今日`;
  } else if (deltaInHours <= 48) {
    // https://zh-yue.wikipedia.org/wiki/尋日
    return `尋日`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('zh-HK').format(date);
  }

  return date.toLocaleString('zh-HK', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function botSaidSomething(avatarInitials, text) {
  return `Bot ${avatarInitials} 話：${text}`;
}

function userSaidSomething(avatarInitials, text) {
  return `用家 ${avatarInitials} 話：${text}`;
}

export default {
  FAILED_CONNECTION_NOTIFICATION: '接駁唔倒。',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  INITIAL_CONNECTION_NOTIFICATION: '接駁緊…',
  INTERRUPTED_CONNECTION_NOTIFICATION: '網絡暫時斷咗，試緊再駁返…',
  RENDER_ERROR_NOTIFICATION: 'Render 出事，請睇下 console 或者同 bot 開發人員聯絡。',
  SEND_FAILED_KEY: `傳送唔倒。{Retry}。`,
  SLOW_CONNECTION_NOTIFICATION: '接駁嘅時間比平時長。',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  'Adaptive Card parse error': 'Adaptive Card 解析出事',
  'Adaptive Card render error': 'Adaptive Card render 出事',
  Chat: '傾偈',
  'Download file': '下載檔案',
  'Microphone off': '閂咪',
  'Microphone on': '開咪',
  Left: '左',
  'Listening…': '聽緊你講嘢…',
  'New messages': '新訊息',
  Retry: '再嚟一次',
  Right: '右',
  Sending: '而家傳送緊',
  'Starting…': '開始緊…',
  Tax: '稅',
  Total: '總共',
  VAT: '消費稅',
  Send: '傳送',
  Speak: '講嘢',
  'Upload file': '上載檔案',
  'Type your message': '請打你嘅訊息'
};
