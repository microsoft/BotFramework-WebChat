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
    return 'עכשיו';
  } else if (deltaInMinutes === 1) {
    return 'לפני דקה';
  } else if (deltaInHours < 1) {
    return ` לפני ${deltaInMinutes} דקות `;
  } else if (deltaInHours === 1) {
    return `לפני שעה`;
  } else if (deltaInHours < 5) {
    return ` לפני ${deltaInHours} שעות `;
  } else if (deltaInHours <= 24) {
    return `היום`;
  } else if (deltaInHours <= 48) {
    return `אתמול`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('he-IL').format(date);
  }
  return date.toLocaleString('he-IL', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function botSaidSomething(avatarInitials, text) {
  return `הבוט ${avatarInitials} אמר, ${text}`;
}

function downloadFileWithFileSize(downloadFileText, fileName, size) {
  // Full text should read: "Download file <filename> of size <filesize>"
  return `${downloadFileText} ${fileName} בגודל ${size}`;
}

function uploadFileWithFileSize(fileName, size) {
  return `${fileName} בגודל ${size}`;
}

function userSaidSomething(avatarInitials, text) {
  return `המשתמש ${avatarInitials} אמר, ${text}`;
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'החיבור נכשל.',
  INITIAL_CONNECTION_NOTIFICATION: 'מתחבר…',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'ניתוקים ברשת. מנסה להתחבר מחדש…',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  RENDER_ERROR_NOTIFICATION: 'שגירה בהצגת הרכיב. בבקשה בדוק את הדפדפן שלך או צור קשר עם צוות הפיתוח.',
  SEND_FAILED_KEY: 'שליחה נכשלה. {Retry}.',
  SLOW_CONNECTION_NOTIFICATION: 'זמן ההתחברות ארוך מהרגיל.',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  // '[File of type '%1']",
  // '[Unknown Card '%1']',
  'Adaptive Card parse error': 'Adaptive Card parse error',
  'Adaptive Card render error': 'Adaptive Card render error',
  Chat: "צ'אט",
  DownloadFileWithFileSize: downloadFileWithFileSize,
  Left: 'שמאל',
  'Listening…': 'מאזין…',
  'New messages': 'הודעות חדשות',
  retry: 'נסה שנית',
  Right: 'ימין',
  // Do not localize {retry}, it is a placeholder for "retry"
  'Send failed, {retry}': 'שליחה נכשלה, {retry}',
  Send: 'שלח',
  Sending: 'שולח',
  Speak: 'דבר',
  'Starting…': 'מתחיל…',
  Tax: 'מס',
  Total: 'סה"כ',
  'Type your message': 'הכנס הודעה',
  'Upload file': 'העלה קובץ',
  UploadFileWithFileSize: uploadFileWithFileSize,
  VAT: 'מע"מ'
};
