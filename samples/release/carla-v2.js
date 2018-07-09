;
var carlaBotConfigs = {};

var carlaBot = (function () {
  var __carlaChatBotStatesKeys = {
    LOCAL_STORAGE: '__kian_chat_state',
    OPENED: 'opened',
    COLLAPSED: 'collapsed'
  }

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
    KIAN_DEFAULT_CHAT_STATE: __carlaChatBotStatesKeys.COLLAPSED
  }

  // The chat state controller
  var __carlaBotStateController = (function () {
    var _currentState;

    function _isValidState(state) {
      return state && (state === __carlaChatBotStatesKeys.OPENED || state === __carlaChatBotStatesKeys.COLLAPSED);
    }

    function setInitialState(isSmallScreen) {
      var configuredInitialState = carlaBotConfigs.CHAT_INITIAL_STATE;

      if (_isValidState(configuredInitialState)) {
        _currentState = configuredInitialState;
      }

      if (localStorage) {
        var localStorageState = localStorage.getItem(__carlaChatBotStatesKeys.LOCAL_STORAGE);

        if (_isValidState(localStorageState)) {
          _currentState = localStorageState;
        }
      }

      if (isSmallScreen || !_isValidState(_currentState)) {
        _currentState = __carlaBotDefaults.KIAN_DEFAULT_CHAT_STATE;
      }
    }

    function setState(state) {
      if (!_isValidState(state)) {
        return;
      }
      _currentState = state;
      if (localStorage) {
        localStorage.setItem(__carlaChatBotStatesKeys.LOCAL_STORAGE, state);
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

      if (state === __carlaChatBotStatesKeys.OPENED || whenOpened) {
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

      if (placement !== 'right' && placement !== 'left') {
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
        'display: ' + (state === __carlaChatBotStatesKeys.OPENED
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

    return {createChatContainer: createChatContainer, createChatWidget: createChatWidget, createChatHeader: createChatHeader, createIFrame: createIFrame, getChatHeight: getChatHeight};

  })();

  // Carla bot event habdlers
  var __carlaEventHandlers = (function () {
    var _closeChat = function (chatContainer, chatWidget) {
      __carlaBotStateController.setState(__carlaChatBotStatesKeys.COLLAPSED);
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
      __carlaBotStateController.setState(__carlaChatBotStatesKeys.OPENED);
      chatWidget.style.display = 'none';
      chatContainer.style.height = __carlaBotHelpers.getChatHeight();
    };

    function chatHeaderClick(chatContainer, chatWidget, chatIframe, isSmallScreen) {
      var currentState = __carlaBotStateController.getState();
      if (currentState === __carlaChatBotStatesKeys.OPENED) {
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

  function initCarlaBot(botUrl) {

    __carlaBotStateController.setInitialState(_isSmallScreen);

    var chatContainer = __carlaBotHelpers.createChatContainer();

    var chatHeader = __carlaBotHelpers.createChatHeader();
    chatContainer.appendChild(chatHeader);

    var chatIFrame = __carlaBotHelpers.createIFrame(botUrl);

    if (__carlaBotStateController.getState() === __carlaChatBotStatesKeys.OPENED) {
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
