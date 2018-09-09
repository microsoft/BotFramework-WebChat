function xMinutesAgo(date) {
  const now = Date.now();
  const deltaInMs = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return '啱啱';
  } else if (deltaInMinutes === 1) {
    return '一分鐘前';
  } else if (deltaInHours < 1) {
    return `${ deltaInMinutes } 分鐘前`;
  } else if (deltaInHours === 1) {
    return `一個鐘前`;
  } else if (deltaInHours < 5) {
    return `${ deltaInHours } 個鐘前`;
  } else if (deltaInHours <= 24) {
    return `今日`;
  } else if (deltaInHours <= 48) {
    // https://zh-yue.wikipedia.org/wiki/尋日
    return `尋日`;
  } else {
    return new Intl.DateTimeFormat('zh-HK').format(date);
  }
}

export default {
  'Type your message': '請打你嘅訊息',
  'X minutes ago': xMinutesAgo
}
