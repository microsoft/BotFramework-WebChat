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
  const countofMinutesIsTen = 10; /* used for arabic translation only */

  if (deltaInMinutes < 1) {
    return 'حالا';
  } else if (deltaInMinutes === 1) {
    return 'منذ دقيقة';
  } else if ((deltaInHours < 1) & (deltaInMinutes <= countofMinutesIsTen)) {
    return `منذ ${deltaInMinutes} دقائق`;
  } else if (deltaInHours < 1) {
    return `منذ ${deltaInMinutes} دقيقة`;
  } else if (deltaInHours === 1) {
    return `منذ ساعة`;
  } else if (deltaInHours < 5) {
    return `منذ ${deltaInHours} ساعات`;
  } else if (deltaInHours <= 24) {
    return `اليوم`;
  } else if (deltaInHours <= 48) {
    return `أمس`;
  }
  return getLocaleString(date, 'ar-EG');
}

function botSaidSomething(avatarInitials, text) {
  return `البوت ${avatarInitials} قال, ${text}`;
}

function downloadFileWithFileSize(downloadFileText, fileName, size) {
  // Full text should read: "Download file <filename> of size <filesize>"
  return `تحميل ملف ${downloadFileText} ${fileName} بحجم ${size}`;
}

function uploadFileWithFileSize(uploadFileText, fileName, size) {
  return `${uploadFileText} ${fileName} بحجم ${size}`;
}

function userSaidSomething(avatarInitials, text) {
  return `المستخدم ${avatarInitials} قال, ${text}`;
}

export default {
  CONNECTED_NOTIFICATION: 'متصل',
  FAILED_CONNECTION_NOTIFICATION: 'غير قادر على الاتصال.',
  INITIAL_CONNECTION_NOTIFICATION: 'يتم التوصيل…',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'حدث انقطاع في الشبكة. إعادة التوصيل…',
  RENDER_ERROR_NOTIFICATION: 'خطأ في التقديم. يرجى التحقق من وحدة التحكم أو الاتصال بمطور البوت.',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `{Retry}. فشل في الإرسال.`,
  SLOW_CONNECTION_NOTIFICATION: 'يستغرق وقتا أطول من المعتاد للاتصال.',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  // '[File of type '%1']': '[File of type '%1']",
  // '[Unknown Card '%1']': '[Unknown Card '%1']',
  'Adaptive Card parse error': 'Adaptive Card parse error',
  'Adaptive Card render error': 'Adaptive Card render error',
  BotSent: 'البوت ارسل:',
  Chat: 'دردشة',
  'Download file': 'تحميل الملف',
  DownloadFileWithFileSize: downloadFileWithFileSize,
  ErrorMessage: 'رسالة خطأ',
  'Microphone off': 'الميكروفون مغلق',
  'Microphone on': 'الميكروفون قيد التشغيل',
  Left: 'يسار',
  'Listening…': 'يستمع…',
  'New messages': 'رسائل جديدة',
  Retry: 'إعادة المحاولة',
  Right: 'يمين',
  Send: 'أرسل',
  SendBox: 'Sendbox',
  Sending: 'أرسال',
  SendStatus: 'ارسل الحالة: ',
  SentAt: 'أرسل: ',
  Speak: 'تكلم',
  'Starting…': 'يبدأ…',
  Tax: 'ضريبة',
  Total: 'المجموع',
  'Type your message': 'اكتب رسالتك',
  TypingIndicator: 'عرض مؤشر الكتابة',
  'Upload file': 'رفع الملف',
  UploadFileWithFileSize: uploadFileWithFileSize,
  UserSent: 'المستخدم أرسل: ',
  VAT: 'ضريبة القيمة المضافة'
};
