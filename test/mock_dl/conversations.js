"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conversations = {};
function createConversationID() {
    return `C_${Math.random().toString(36).substr(2, 5)}`;
}
class Conversation {
    constructor() {
        this.messages = [];
        this.nextWatermark = 1;
    }
    ack(watermark) {
        this.messages = this.messages.filter(message => message.watermark > watermark);
    }
    getMessages(ackWatermark) {
        this.ack(ackWatermark);
        return this.messages[0];
    }
    pushMessage(content) {
        this.messages.push(new Message(this.nextWatermark, content));
        return this.nextWatermark++;
    }
}
class Message {
    constructor(watermark, activity) {
        this.watermark = watermark;
        this.activity = activity;
    }
}
exports.Message = Message;
function createConversation() {
    const id = createConversationID();
    console.log(`Creating new conversation ${id}`);
    conversations[id] = new Conversation();
    return id;
}
exports.createConversation = createConversation;
function getMessage(conversationID, watermark) {
    return conversations[conversationID].getMessages(watermark);
}
exports.getMessage = getMessage;
function pushMessage(conversationID, activity) {
    return conversations[conversationID].pushMessage(activity);
}
exports.pushMessage = pushMessage;
function endConversation(conversationID) {
    console.log(`Ending conversation ${conversationID}`);
    delete conversations[conversationID];
}
exports.endConversation = endConversation;
//# sourceMappingURL=conversations.js.map