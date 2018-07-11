import * as konsole from '../Konsole';
import { Activity } from 'botframework-directlinejs';

// establish a limit so we don't exceed localstorage
const MESSAGES_LIMIT = 500;
const MESSAGES_ROTATION_NUMBER = 50;
const MESSAGE_STORAGE_KEY = 'messages';

const rotateMessages = (messages: Activity[]) => {
  if (messages.length > MESSAGES_LIMIT) {
    messages.splice(0, MESSAGES_ROTATION_NUMBER);
  }
};

const removePersonalData = (message: Activity) => {
  const newMessage = JSON.parse(JSON.stringify(message));

  if (typeof newMessage.text === 'string') {
    // phone number
    newMessage.text =
      newMessage.text.replace(
        /(?:\d{1}\s)?\(?(\d{3})\)?-?\s?(\d{3})-?\s?(\d{4})/g,
        '[phone removed]');

    // email
    newMessage.text =
      newMessage.text.replace(
        /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i,
        '[email removed]');

    // vin number
    newMessage.text =
      newMessage.text.replace(
        /([A-HJ-NPR-Z\d]{3})([A-HJ-NPR-Z\d]{5})([\dX])(([A-HJ-NPR-Z\d])([A-HJ-NPR-Z\d])([A-HJ-NPR-Z\d]{6}))/i,
        '[vin removed]');
  }

  return newMessage;
};

export const getStoredMessages = () => {
    try {
      const storage = window.localStorage;
      if (storage) {
        const value = storage.getItem(MESSAGE_STORAGE_KEY) || '[]';
        const messages = JSON.parse(value);
        return messages;
      }
      return [];
    } catch (e) {
      return [];
    }
}

const storeMessage = (message: Activity) => {
  try {
    const storage = window.localStorage;
    if (storage) {
      const value = storage.getItem(MESSAGE_STORAGE_KEY) || '[]';
      const messages = JSON.parse(value);
      const cleanedMessage = removePersonalData(message);
      messages.push(cleanedMessage);
      rotateMessages(messages);
      storage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages));
    }
  } catch (err) {
    konsole.log("Failed storing messages", err);
  }
};

export default storeMessage;
