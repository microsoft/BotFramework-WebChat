(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.12&autoLogAppEvents=1';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

var carlaBotConfigs = {};

var carlaBot = (function () {

  var _chatContainer;
  var _chatWidget;
  var _fbRoot;

  var __carlaChatBotStatesKeys = {
    LOCAL_STORAGE: '__kian_chat_state',
    OPENED: 'opened',
    COLLAPSED: 'collapsed'
  }

  // The app default which will handle the user invalid configs too
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

    return {
      setInitialState: setInitialState,
      setState: setState,
      getState: getState
    };

  })();

  // Carla bot helper functions
  var __carlaBotHelpers = (function () {
    var getChatHeight = function (whenOpened) {
      var visibleHeight = carlaBotConfigs.CHAT_CONTAINER_HEIGHT;
      // By default it is 0 but we assume that the user may want to see the chat header while the chat is collapsed (Not fully supported yet)
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

      if (!width || isNaN(width)) {
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

      if (offset === undefined || isNaN(offset)) {
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
      _chatContainer = document.createElement('div');
      _chatContainer.className = '__carla-chat-container';
      var chatContainerStyle = [
        getChatWindowPlacement(), 'width: ' + getChatWidth(),
        'height: ' + getChatHeight()
      ].join(';');
      _chatContainer.setAttribute('style', chatContainerStyle);

      return _chatContainer;
    }

    function createChatWidget() {
      var state = __carlaBotStateController.getState();
      _chatWidget = document.createElement('div');
      _chatWidget.className = '__carla-chat-teaser';
      chatWidgetStyle = [
        'display: ' + (state === __carlaChatBotStatesKeys.OPENED
          ? 'none'
          : 'block'),
        getChatWindowPlacement()
      ].join(';');
      _chatWidget.setAttribute('style', chatWidgetStyle);

      var chatWidgetBubble = document.createElement('div');
      chatWidgetBubble.className = 'bubble';
      chatWidgetBubble.innerText = carlaBotConfigs.KIAN_CHAT_WIDGET_TEXT || __carlaBotDefaults.KIAN_CHAT_DEFAULT_WIDGET_TEXT;
      _chatWidget.appendChild(chatWidgetBubble);

      return _chatWidget;
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

    function onDocumentReady(chatContainer, chatWidget, isSmallScreen) {
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

    return {
      onDocumentReady: onDocumentReady,
      chatHeaderClick: chatHeaderClick,
      chatWidgetClick: chatWidgetClick
    };

  })();

  function _initCarlaBot(botUrl) {
    var _isSmallScreen = document.documentElement.clientWidth <= 768;

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
    });
    chatHeader.addEventListener('click', function (event) {
      __carlaEventHandlers.chatHeaderClick(chatContainer, chatWidget, chatIFrame, _isSmallScreen);
    });
    __carlaEventHandlers.onDocumentReady(chatContainer, chatWidget, _isSmallScreen);
  }

  var _chatToDisplay = function (chat) {
    switch (chat){
      case "fb":
        _chatContainer.style.visibility = "hidden";
        _chatWidget.style.visibility = "hidden";
        _fbRoot.style.display = "block";
        break;

      case "web":
        _chatContainer.style.visibility = "visible";
        _chatWidget.style.visibility = "visible";
        _fbRoot.style.display = "none";
        break;
        default :
        _chatToDisplay("web");
    }
  };

  var _initFBChatPlugin = function (appId, fbPageId) {
    if(!appId || !fbPageId){
      return false;
    }
    _fbRoot = document.createElement('div');
    _fbRoot.style.display = "none";
    _fbRoot.id = "fb-root";
    document.body.appendChild(_fbRoot);

    var fbChatContainer = document.createElement('div');
    fbChatContainer.className = 'fb-customerchat';
    fbChatContainer.setAttribute('page_id', fbPageId);
    fbChatContainer.setAttribute('theme_color', "#c4172c");
    fbChatContainer.setAttribute('logged_in_greeting', __carlaBotDefaults.KIAN_CHAT_CONTAINER_DEFAULT_HEADER_TEXT);
    _fbRoot.appendChild(fbChatContainer);

      // FB To Call This After It Has Loaded
    window.fbAsyncInit = function(){
      FB.init({
          appId  : appId,
          status : true,
          cookie : true,
          version: 'v2.12'
      });
      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') { // Logged In And Has Authorized App
          _chatToDisplay("fb");
        }else if(response.status === 'not_authorized') { // Logged In But Hasn't Authorized App
          FB.login();
        }else{ // Not Logged In
          _chatToDisplay("web");
        }
      });

      // Subscribe To Authentication Events Especially After When User Gives Authorization To App
      FB.Event.subscribe('auth.statusChange', function(response) {
        if (response.status === 'connected') {
          _chatToDisplay("fb");
        }else{
          _chatToDisplay("web");
        }
      });

    };

  };

  var initBot = function (botParams) {
    _initCarlaBot(botParams.botUrl);
    _initFBChatPlugin(botParams.appId, botParams.fbPageId);
  }

  return {init: initBot};

})();
