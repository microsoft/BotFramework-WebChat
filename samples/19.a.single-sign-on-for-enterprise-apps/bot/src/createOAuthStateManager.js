const createStateManager = require('./utils/createStateManager');
const getConversationState = require('./getConversationState');

const conversationState = getConversationState();
const oauthStateAccessor = conversationState.createProperty('state/oauth');

module.exports = function createOAuthStateManager(context) {
  return createStateManager(
    getConversationState(),
    oauthStateAccessor,
    context,
    {
      accessToken: '',
      provider: ''
    }
  );
};
