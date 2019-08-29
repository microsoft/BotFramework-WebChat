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
        return 'حالياً';
    } else if (deltaInMinutes === 1) {
        return 'منذ دقيقة';
    } else if (deltaInHours < 1) {
        return `${deltaInMinutes} minutes ago`;
    } else if (deltaInHours === 1) {
        return `منذ ساعة`;
    } else if (deltaInHours < 5) {
        return `${deltaInHours} hours ago`;
    } else if (deltaInHours <= 24) {
        return `اليوم`;
    } else if (deltaInHours <= 48) {
        return `الامس`;
    }
    return getLocaleString(date, 'ar-AR');
}

function botSaidSomething(avatarInitials, text) {
    return `${avatarInitials} اجاب, ${text}`;
}

function downloadFileWithFileSize(downloadFileText, fileName, size) {
    // Full text should read: "Download file <filename> of size <filesize>"
    return `${downloadFileText} ${fileName}  من حجم ${size}`;
}

function uploadFileWithFileSize(fileName, size) {
    return `${fileName} من حجم ${size}`;
}

function userSaidSomething(avatarInitials, text) {
    return `المستخدم ${avatarInitials} اجاب, ${text}`;
}

export default {
    CONNECTED_NOTIFICATION: 'متصل',
    FAILED_CONNECTION_NOTIFICATION: 'غير قادر على الاتصال.',
    INITIAL_CONNECTION_NOTIFICATION: 'اتصال ...',
    INTERRUPTED_CONNECTION_NOTIFICATION: 'حدث انقطاع في الشبكة. إعادة اتصال ... ',
    RENDER_ERROR_NOTIFICATION: 'هناك مشكلة في العرض، الرجاء التواصل مع المطور',
    // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
    SEND_FAILED_KEY: `فشل إرسال. {Retry}.`,
    SLOW_CONNECTION_NOTIFICATION: 'يستغرق وقتا أطول من المعتاد للاتصال.',
    'Bot said something': botSaidSomething,
    'User said something': userSaidSomething,
    'X minutes ago': xMinutesAgo,
    // '[File of type '%1']': '[File of type '%1']",
    // '[Unknown Card '%1']': '[Unknown Card '%1']',
    'Adaptive Card parse error': 'Adaptive Card خطأ',
    'Adaptive Card render error': 'Adaptive Card خطأ في عرض',
    BotSent: 'تم الارسال: ',
    Chat: 'محادثة',
    'Download file': 'تحميل الملف',
    DownloadFileWithFileSize: downloadFileWithFileSize,
    ErrorMessage: 'خطأ',
    'Microphone off': 'الميكروفون مغلق',
    'Microphone on': 'الميكروفون يعمل',
    Left: 'يسار',
    'Listening…': 'الاستماع…',
    'New messages': 'رسائل جديدة',
    Retry: 'حاول مرة اخرى',
    Right: 'يمين',
    Send: 'ارسل',
    Sending: 'ارسال',
    SendStatus: 'حالة الارسال:',
    SentAt: 'ارسلت ب',
    Speak: 'تكلم',
    'Starting…': 'بداية …',
    Tax: 'ضريبة',
    Total: 'كلياً',
    'Type your message': 'اكتب سؤالك',
    TypingIndicator: 'عرض مؤشر الكتابة',
    'Upload file': 'تحميل ملف',
    UploadFileWithFileSize: uploadFileWithFileSize,
    UserSent: 'ارسل المستخدم:',
    VAT: 'ضريبة'
};
