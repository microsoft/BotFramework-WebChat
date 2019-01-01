function xMinutesAgo(date) {
  const now = Date.now();
  const deltaInMs = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return '刚刚';
  } else if (deltaInMinutes === 1) {
    return '一分钟前';
  } else if (deltaInHours < 1) {
    return `${ deltaInMinutes } 分钟前`;
  } else if (deltaInHours === 1) {
    return `一个钟前`;
  } else if (deltaInHours < 5) {
    return `${ deltaInHours } 个钟前`;
  } else if (deltaInHours <= 24) {
    return `今日`;
  } else if (deltaInHours <= 48) {
    return `昨日`;
  } else {
    return new Intl.DateTimeFormat('zh-HANS').format(date);
  }
}

export default {
  'Chat': '聊天',
  // 'Download file': '',
  // 'Microphone off': '',
  // 'Microphone on': '',
  'Left': '左',
  'Listening…': '正在倾听…',
  'New messages': '新讯息',
  'retry': '重试',
  'Right': '右',
  'Send failed, {retry}': '无法发送，{retry}',
  'Send': '发送',
  'Sending': '正在发送',
  'Speak': '发言',
  'Starting…': '开始中…',
  'Tax': '税',
  'Total': '共计',
  'Type your message': '输入你的消息',
  'Upload file': '上传文件',
  'VAT': '消费税',
  'X minutes ago': xMinutesAgo
}
