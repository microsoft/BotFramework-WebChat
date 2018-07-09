;
var carlaBotConfigs = {};

var carlaBot = (function () {
  // The app default which will handle the user invalid configs
  var __carlaBotDefaults = {
    CHAT_CONTAINER_DEFAULT_WIDTH: 500,
    CHAT_CONTAINER_DEFAULT_OFFSET: 10,
    CHAT_CONTAINER_DEFAULT_HEIGHT: 500,
    CHAT_CONTAINER_DEFAULT_HIDDEN_HEIGHT: 0,
    CHAT_CONTAINER_DEFAULT_HEADER_HEIGHT: 40,
    CHAT_CONTAINER_DEFAULT_PLACEMENT: 'left',
    KIAN_CHAT_CONTAINER_DEFAULT_HEADER_TEXT: 'Chat with Kian',
    KIAN_CHAT_DEFAULT_WIDGET_TEXT: 'Let\'s chat!',
    KIAN_CHAT_LOCAL_STORAGE_STATE_KEY: '__kian_chat_state',
    CHAT_STATE_OPEN: 'opened',
    CHAT_STATE_COLLAPSED: 'collapsed'
  }

  // The chat state controller
  var __carlaBotStateController = (function () {
    var _currentState;

    function setInitialState(initialState, isSmallScreen) {
      _currentState = initialState;

      if (localStorage) {
        _currentState = localStorage.getItem(__carlaBotDefaults.KIAN_CHAT_LOCAL_STORAGE_STATE_KEY) || initialState;
      }

      if (isSmallScreen || !_currentState || (_currentState !== __carlaBotDefaults.CHAT_STATE_OPEN && _currentState !== __carlaBotDefaults.CHAT_STATE_COLLAPSED)) {
        _currentState = __carlaBotDefaults.CHAT_STATE_COLLAPSED;
      }
    }

    function setState(state) {
      _currentState = state;
      if (localStorage) {
        localStorage.setItem(__carlaBotDefaults.KIAN_CHAT_LOCAL_STORAGE_STATE_KEY, state);
      }
    }

    function getState() {
      return _currentState;
    }

    return {setInitialState: setInitialState, setState: setState, getState: getState}
  })();

  // Carla bot helper functions
  var __carlaBotHelpers = (function () {
    var getChatHeight = function (whenOpened) {
      var visibleHeight = carlaBotConfigs.CHAT_CONTAINER_HEIGHT;
      var hiddenHeight = __carlaBotDefaults.CHAT_CONTAINER_DEFAULT_HIDDEN_HEIGHT;
      var state = __carlaBotStateController.getState();
      var height;

      if (state === __carlaBotDefaults.CHAT_STATE_OPEN || whenOpened) {
        if (!visibleHeight || isNaN(visibleHeight)) {
          visibleHeight = __carlaBotDefaults.CHAT_CONTAINER_DEFAULT_HEIGHT;
        }
        height = visibleHeight;
      } else {
        height = hiddenHeight;
      }
      return height + 'px';
    };

    var getChatWidth = function () {
      var width = carlaBotConfigs.CHAT_CONTAINER_WIDTH;

      if (width === '' || isNaN(width)) {
        width = __carlaBotDefaults.CHAT_CONTAINER_DEFAULT_WIDTH;
      }
      return width + 'px';
    };

    var getChatWindowPlacement = function () {
      var offset = carlaBotConfigs.CHAT_CONTAINER_OFFSET;
      var placement = carlaBotConfigs.CHAT_CONTAINER_PLACEMENT;

      if(placement !== 'right' && placement !== 'left') {
        placement = __carlaBotDefaults.CHAT_CONTAINER_DEFAULT_PLACEMENT
      }

      if (offset === '' || isNaN(offset)) {
        offset = __carlaBotDefaults.CHAT_CONTAINER_DEFAULT_OFFSET;
      }

      return placement + ':' + offset + 'px';
    };

    function createChatHeader() {
      var chatHeader = document.createElement('div');
      chatHeader.className = '__carla-chat-header';
      chatHeader.innerText = carlaBotConfigs.KIAN_CHAT_CONTAINER_HEADER_TEXT || __carlaBotDefaults.KIAN_CHAT_CONTAINER_DEFAULT_HEADER_TEXT;
      chatHeaderStyle = 'height: ' + __carlaBotDefaults.CHAT_CONTAINER_DEFAULT_HEADER_HEIGHT + 'px;';
      chatHeader.setAttribute('style', chatHeaderStyle);

      var closeButton = document.createElement('div');
      closeButton.className = 'close-button';
      chatHeader.appendChild(closeButton);

      return chatHeader;
    }

    function createIFrame(botUrl) {
      var chatIframe = document.createElement('iframe');
      chatIframe.frameborder = 0;
      chatIframe.src = botUrl;
      chatIframe.className = '__carla-iframe';
      chatIframeStyle = 'height: ' + __carlaBotHelpers.getChatHeight(true);
      chatIframe.setAttribute('style', chatIframeStyle);

      return chatIframe;
    }

    function createChatContainer() {
      var chatContainer = document.createElement('div');
      chatContainer.className = '__carla-chat-container';
      var chatContainerStyle = [
        getChatWindowPlacement(), 'width: ' + getChatWidth(),
        'height: ' + getChatHeight()
      ].join(';');
      chatContainer.setAttribute('style', chatContainerStyle);

      return chatContainer;
    }

    function createChatWidget() {
      var state = __carlaBotStateController.getState();
      var chatWidget = document.createElement('div');
      chatWidget.className = '__carla-chat-teaser';
      chatWidgetStyle = [
        'display: ' + (state === __carlaBotDefaults.CHAT_STATE_OPEN
          ? 'none'
          : 'block'),
        getChatWindowPlacement()
      ].join(';');
      chatWidget.setAttribute('style', chatWidgetStyle);

      var chatWidgetBubble = document.createElement('div');
      chatWidgetBubble.className = 'bubble';
      chatWidgetBubble.innerText = carlaBotConfigs.KIAN_CHAT_WIDGET_TEXT || __carlaBotDefaults.KIAN_CHAT_DEFAULT_WIDGET_TEXT;
      chatWidget.appendChild(chatWidgetBubble);

      return chatWidget;
    }

    return {
      createChatContainer: createChatContainer,
      createChatWidget: createChatWidget,
      createChatHeader: createChatHeader,
      createIFrame: createIFrame,
      getChatHeight: getChatHeight
    };

  })();

  // Carla bot event habdlers
  var __carlaEventHandlers = (function () {
    var _closeChat = function (chatContainer, chatWidget) {
      __carlaBotStateController.setState(__carlaBotDefaults.CHAT_STATE_COLLAPSED);
      chatContainer.style.height = __carlaBotHelpers.getChatHeight();
      chatWidget.style.display = 'block';
    };

    var _openChat = function (botUrl, chatContainer, chatWidget, chatIframe, isSmallScreen) {
      if (isSmallScreen) {
        window.open(botUrl);
        return;
      }
      if (!chatContainer.contains(chatIframe)) {
        chatContainer.appendChild(chatIframe);
      }
      __carlaBotStateController.setState(__carlaBotDefaults.CHAT_STATE_OPEN);
      chatWidget.style.display = 'none';
      chatContainer.style.height = __carlaBotHelpers.getChatHeight();
    };

    function chatHeaderClick(chatContainer, chatWidget, chatIframe, isSmallScreen) {
      var currentState = __carlaBotStateController.getState();
      if (currentState === __carlaBotDefaults.CHAT_STATE_OPEN) {
        _closeChat(chatContainer, chatWidget);
      }
    };

    function chatWidgetClick(botUrl, chatContainer, chatWidget, chatIframe, isSmallScreen) {
      _openChat(botUrl, chatContainer, chatWidget, chatIframe, isSmallScreen);
    };

    function inDocumentReady(chatContainer, chatWidget, isSmallScreen) {
      document.onreadystatechange = function () {
        if (document.readyState === 'complete') {
          if (!isSmallScreen) {
            document
              .body
              .appendChild(chatContainer);
          }
          document
            .body
            .appendChild(chatWidget);
        }
      };
    }

    return {inDocumentReady: inDocumentReady, chatHeaderClick: chatHeaderClick, chatWidgetClick: chatWidgetClick};
  })();

  var _isSmallScreen = document.documentElement.clientWidth <= 768;
  function initCarlaBot(botUrl, initialState = '') {

    __carlaBotStateController.setInitialState(initialState, _isSmallScreen);

    var chatContainer = __carlaBotHelpers.createChatContainer();

    var chatHeader = __carlaBotHelpers.createChatHeader();
    chatContainer.appendChild(chatHeader);

    var chatIFrame = __carlaBotHelpers.createIFrame(botUrl);

    if (__carlaBotStateController.getState() === __carlaBotDefaults.CHAT_STATE_OPEN) {
      chatContainer.appendChild(chatIFrame);
    }

    var chatWidget = __carlaBotHelpers.createChatWidget();

    chatWidget.addEventListener('click', function (event) {
      __carlaEventHandlers.chatWidgetClick(botUrl, chatContainer, chatWidget, chatIFrame, _isSmallScreen);
    })
    chatHeader.addEventListener('click', function (event) {
      __carlaEventHandlers.chatHeaderClick(chatContainer, chatWidget, chatIFrame, _isSmallScreen);
    })
    __carlaEventHandlers.inDocumentReady(chatContainer, chatWidget, _isSmallScreen);
  }

  return {init: initCarlaBot};
})();
