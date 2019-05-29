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
    return '刚刚';
  } else if (deltaInMinutes === 1) {
    return '一分钟前';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} 分钟前`;
  } else if (deltaInHours === 1) {
    return `一个钟前`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} 个钟前`;
  } else if (deltaInHours <= 24) {
    return `今日`;
  } else if (deltaInHours <= 48) {
    return `昨日`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('zh-HANS').format(date);
  }

  return date.toLocaleString('zh-HANS', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default {
  FAILED_CONNECTION_NOTIFICATION: '接驳失败。',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `无法发送。{Retry}`,
  SLOW_CONNECTION_NOTIFICATION: '接驳时间比平时长。',
  Chat: '聊天',
  'Download file': '下载文件',
  'Microphone off': '关掉麦克风',
  'Microphone on': '打开麦克风',
  Left: '左',
  'Listening…': '正在倾听…',
  'New messages': '新讯息',
  Retry: '重试',
  Right: '右',
  Send: '发送',
  Sending: '正在发送',
  Speak: '发言',
  'Starting…': '开始中…',
  Tax: '税',
  Total: '共计',
  'Type your message': '输入你的消息',
  'Upload file': '上传文件',
  VAT: '消费税',
  'X minutes ago': xMinutesAgo
};
