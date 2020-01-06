const { ConversationState, MemoryStorage } = require('botbuilder');

const storage = new MemoryStorage();
const conversationState = new ConversationState(storage);

module.exports = () => conversationState;
