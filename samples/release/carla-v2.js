var carlaBotConfigs = {};

var carlaBot = (function () {

  var _chatContainer = document.createElement('div');
  var _chatWidget = document.createElement('div');
  var _fbRoot = document.createElement('div');

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

    var _getChatWidth = function () {
      var width = carlaBotConfigs.CHAT_CONTAINER_WIDTH;

      if (!width || isNaN(width)) {
        width = __carlaBotDefaults.CHAT_CONTAINER_DEFAULT_WIDTH;
      }
      return width + 'px';
    };

    var _getChatWindowPlacement = function () {
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
      chatIframeStyle = 'height: ' + getChatHeight(true);
      chatIframe.setAttribute('style', chatIframeStyle);

      return chatIframe;
    }

    function createChatContainer() {
      _chatContainer.className = '__carla-chat-container';
      var chatContainerStyle = [
        _getChatWindowPlacement(), 'width: ' + _getChatWidth(),
        'height: ' + getChatHeight()
      ].join(';');
      _chatContainer.setAttribute('style', chatContainerStyle);

      return _chatContainer;
    }

    function createChatWidget() {
      var state = __carlaBotStateController.getState();
      _chatWidget.className = '__carla-chat-teaser';
      chatWidgetStyle = [
        'display: ' + (state === __carlaChatBotStatesKeys.OPENED
          ? 'none'
          : 'block'),
        _getChatWindowPlacement()
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

  // Carla bot event handlers
  var __carlaEventHandlers = (function () {
    var _closeChat = function () {
      __carlaBotStateController.setState(__carlaChatBotStatesKeys.COLLAPSED);
      _chatContainer.style.height = __carlaBotHelpers.getChatHeight();
      _chatWidget.style.display = 'block';
    };

    var _openChat = function (botUrl, chatIframe, isSmallScreen) {
      if (isSmallScreen) {
        window.open(botUrl);
        return;
      }
      if (!_chatContainer.contains(chatIframe)) {
        _chatContainer.appendChild(chatIframe);
      }
      __carlaBotStateController.setState(__carlaChatBotStatesKeys.OPENED);
      _chatWidget.style.display = 'none';
      _chatContainer.style.height = __carlaBotHelpers.getChatHeight();
    };

    function chatHeaderClick() {
      var currentState = __carlaBotStateController.getState();
      if (currentState === __carlaChatBotStatesKeys.OPENED) {
        _closeChat();
      }
    };

    function chatWidgetClick(botUrl, chatIframe, isSmallScreen) {
      _openChat(botUrl, chatIframe, isSmallScreen);
    };

    function onDocumentReady(isSmallScreen) {
      document.onreadystatechange = function () {
        if (document.readyState === 'complete') {
          if (!isSmallScreen) {
            document
              .body
              .appendChild(_chatContainer);
          }
          document
            .body
            .appendChild(_chatWidget);
        }
      };
    }

    return {
      onDocumentReady: onDocumentReady,
      chatHeaderClick: chatHeaderClick,
      chatWidgetClick: chatWidgetClick
    };

  })();

  // Carla bot loading handler
  var __carlaBotLoaders = (function () {

    var _loadFaceBookSDK = function () {
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.12&autoLogAppEvents=1';
        fjs.parentNode.insertBefore(js, fjs);
      })(document, 'script', 'facebook-jssdk');
    };

    var _chatToDisplay = function (chat) {
      switch (chat) {
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

    var initCarlaBot = function (botUrl) {
      var _isSmallScreen = document.documentElement.clientWidth <= 768;

      __carlaBotStateController.setInitialState(_isSmallScreen);

      __carlaBotHelpers.createChatContainer();

      var chatHeader = __carlaBotHelpers.createChatHeader();
      _chatContainer.appendChild(chatHeader);

      var chatIFrame = __carlaBotHelpers.createIFrame(botUrl);

      if (__carlaBotStateController.getState() === __carlaChatBotStatesKeys.OPENED) {
        _chatContainer.appendChild(chatIFrame);
      }

      __carlaBotHelpers.createChatWidget();

      _chatWidget.addEventListener('click', function (event) {
        __carlaEventHandlers.chatWidgetClick(botUrl, chatIFrame, _isSmallScreen);
      });
      chatHeader.addEventListener('click', function (event) {
        __carlaEventHandlers.chatHeaderClick(chatIFrame, _isSmallScreen);
      });
      __carlaEventHandlers.onDocumentReady(_isSmallScreen);

    }

    var initFBChatPlugin = function (appId, fbPageId) {
      if (!appId || !fbPageId) {
        _chatToDisplay("web");
        return false;
      }

      _loadFaceBookSDK();

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
      window.fbAsyncInit = function() {
        FB.init({
            appId  : appId,
            status : true,
            cookie : true,
            version: 'v2.12'
        });
        FB.getLoginStatus(function(response) {
          if (response.status === 'connected') { // Logged In And Has Authorized App
            _chatToDisplay("fb");
          } else if (response.status === 'not_authorized') { // Logged In But Hasn't Authorized App
            FB.login();
          } else { // Not Logged In
            _chatToDisplay("web");
          }
        });

        // Subscribe To Authentication Events Especially After When User Gives Authorization To App
        FB.Event.subscribe('auth.statusChange', function(response) {
          if (response.status === 'connected') {
            _chatToDisplay("fb");
          } else {
            _chatToDisplay("web");
          }
        });

      };

    };

    return {
      initCarlaBot: initCarlaBot,
      initFBChatPlugin: initFBChatPlugin
    };

  })();

  var initBot = function (botParams) {
    __carlaBotLoaders.initCarlaBot(botParams.botUrl);
    __carlaBotLoaders.initFBChatPlugin(botParams.appId, botParams.fbPageId);
  }

  return {init: initBot};

})();
