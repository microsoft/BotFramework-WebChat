var carlaBotConfigs = {};

var carlaBot = (function () {

  var _chatContainer = document.createElement('div');
  var _chatWidget = document.createElement('div');
  var _fbRoot = document.createElement('div');
  var _minimizeButton = document.createElement('div');
  var _chatIframe = document.createElement('iframe');
  var botUrl;

  var __carlaChatBotStatesKeys = {
    LOCAL_STORAGE: '__kian_chat_state',
    OPENED: 'opened',
    COLLAPSED: 'collapsed',
    MINIMIZED: 'minimized',
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
      return state && (state === __carlaChatBotStatesKeys.OPENED || state === __carlaChatBotStatesKeys.COLLAPSED || state === __carlaChatBotStatesKeys.MINIMIZED );
    }

    function setInitialState() {
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

      if (__carlaBotHelpers.isSmallScreen() || !_isValidState(_currentState)) {
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
      } else if (state === __carlaChatBotStatesKeys.MINIMIZED ){
        height = __carlaBotDefaults.CHAT_CONTAINER_DEFAULT_HEADER_HEIGHT;
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
      var state = __carlaBotStateController.getState();
      var chatHeader = document.createElement('div');
      chatHeader.className = '__carla-chat-header';
      chatHeader.innerText = carlaBotConfigs.KIAN_CHAT_CONTAINER_HEADER_TEXT || __carlaBotDefaults.KIAN_CHAT_CONTAINER_DEFAULT_HEADER_TEXT;
      chatHeaderStyle = 'height: ' + __carlaBotDefaults.CHAT_CONTAINER_DEFAULT_HEADER_HEIGHT + 'px;';
      chatHeader.setAttribute('style', chatHeaderStyle);

      var closeButton = document.createElement('div');
      closeButton.className = 'close-button';
      chatHeader.appendChild(closeButton);

      var minimizeButtonclass = 'minimize-button';

      if(state === __carlaChatBotStatesKeys.MINIMIZED ){
        minimizeButtonclass += ' open';
      }

      // Needed for broader surface area for clicking
      var _minimizeButtonWrapper = document.createElement('div');
      _minimizeButtonWrapper.className = 'minimize-wrapper';

      _minimizeButton.className = minimizeButtonclass;
      _minimizeButtonWrapper.appendChild(_minimizeButton);
      chatHeader.appendChild(_minimizeButtonWrapper);

      closeButton.addEventListener('click', function (event) {
        __carlaEventHandlers.closeChat();
      });

      _minimizeButtonWrapper.addEventListener('click', function (event) {
        __carlaEventHandlers.minimizeChat();
      });

      return chatHeader;
    }

    function createIFrame() {
      _chatIframe.frameborder = 0;
      _chatIframe.src = botUrl;
      _chatIframe.className = '__carla-iframe';
      chatIframeStyle = 'height: ' + getChatHeight(true);
      _chatIframe.setAttribute('style', chatIframeStyle);
      return _chatIframe;
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
      var isOpened = (state === __carlaChatBotStatesKeys.OPENED);
      var isMinimized = (state === __carlaChatBotStatesKeys.MINIMIZED);
      var displayValue = (isOpened || isMinimized) ? 'none' : 'block';
      chatWidgetStyle = [
        'display: ' + displayValue,
        _getChatWindowPlacement()
      ].join(';');
      _chatWidget.setAttribute('style', chatWidgetStyle);

      var chatWidgetBubble = document.createElement('div');
      chatWidgetBubble.className = 'bubble';
      chatWidgetBubble.innerText = carlaBotConfigs.KIAN_CHAT_WIDGET_TEXT || __carlaBotDefaults.KIAN_CHAT_DEFAULT_WIDGET_TEXT;
      _chatWidget.appendChild(chatWidgetBubble);

      return _chatWidget;
    }

    function isSmallScreen(){
        return document.documentElement.clientWidth <= 768;
    }

    return {
      createChatContainer: createChatContainer,
      createChatWidget: createChatWidget,
      createChatHeader: createChatHeader,
      createIFrame: createIFrame,
      getChatHeight: getChatHeight,
      isSmallScreen: isSmallScreen,
    };

  })();

  // Carla bot event handlers
  var __carlaEventHandlers = (function () {
    var closeChat = function () {
        var currentState = __carlaBotStateController.getState();
        if (currentState === __carlaChatBotStatesKeys.OPENED || currentState === __carlaChatBotStatesKeys.MINIMIZED) {
            __carlaBotStateController.setState(__carlaChatBotStatesKeys.COLLAPSED);
            _chatContainer.style.height = __carlaBotHelpers.getChatHeight();
            _chatWidget.style.display = 'block';
        }
    };

    var openChat = function () {
      if (__carlaBotHelpers.isSmallScreen()) {
        window.open(botUrl);
        return;
      }
      if (!_chatContainer.contains(_chatIframe)) {
        _chatContainer.appendChild(_chatIframe);
      }
      __carlaBotStateController.setState(__carlaChatBotStatesKeys.OPENED);
      _minimizeButton.classList.remove("open");
      _chatWidget.style.display = 'none';
      _chatContainer.style.height = __carlaBotHelpers.getChatHeight();
    };

    var minimizeChat = function () {
        var currentState = __carlaBotStateController.getState();
        if (currentState === __carlaChatBotStatesKeys.MINIMIZED) {
            openChat();
        }else if (currentState === __carlaChatBotStatesKeys.OPENED){
             _minimizeButton.classList.add("open");
            __carlaBotStateController.setState(__carlaChatBotStatesKeys.MINIMIZED);
            _chatContainer.style.height = __carlaBotHelpers.getChatHeight(); // __carlaBotDefaults.CHAT_CONTAINER_DEFAULT_HEADER_HEIGHT + 'px';
        }
    };

    var displayTeaser = function () {
            document
            .body
            .appendChild(_chatWidget);
    }

    var displayBot = function () {
        if(document.contains(_chatWidget)){
            return;
        }
        if (!__carlaBotHelpers.isSmallScreen()) {
            document
              .body
              .appendChild(_chatContainer);
          }
    }

    function onDocumentReady() {
      document.onreadystatechange = function () {
        if (document.readyState === 'complete') {
            displayBot();
            displayTeaser();
        }
      };
    }

    return {
      onDocumentReady: onDocumentReady,
      closeChat: closeChat,
      openChat: openChat,
      minimizeChat: minimizeChat,
      displayBot: displayBot
    };

  })();

  // Carla bot loading handler
  var __carlaBotLoaders = (function () {

    var _loadFaceBookSDK = function () {
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
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

        case "none":
          _chatContainer.style.visibility = "hidden";
          _chatWidget.style.visibility = "hidden";
          _fbRoot.style.display = "none";
          break;

          default :
          _chatToDisplay("web");
      }
    };

    var initCarlaBot = function () {
      __carlaBotStateController.setInitialState();

      var _chatIFrame = __carlaBotHelpers.createIFrame();

      __carlaBotHelpers.createChatContainer();

      var chatHeader = __carlaBotHelpers.createChatHeader();
      _chatContainer.appendChild(chatHeader);


      if (__carlaBotStateController.getState() === __carlaChatBotStatesKeys.OPENED) {
        _chatContainer.appendChild(_chatIFrame);
      }

      __carlaBotHelpers.createChatWidget();

      _chatWidget.addEventListener('click', function (event) {
        __carlaEventHandlers.openChat();
      });

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
            appId: appId,
            status: true,
            cookie: true,
            autoLogAppEvents: true,
            xfbml: true,
            version: 'v3.2'
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
    botUrl = botParams.botUrl;
    __carlaBotLoaders.initCarlaBot();
    __carlaBotLoaders.initFBChatPlugin(botParams.appId, botParams.fbPageId);
  }

  var displayBot = function (botParams) {
    initBot(botParams);
    __carlaEventHandlers.onDocumentReady();
  }

  var openChat = function () {
    __carlaEventHandlers.displayBot();
    __carlaEventHandlers.openChat();
  }

  /* Please bear with the name mismatching it is done for backward compactibility
    The `init` bot now initializes and displays the bot
    While `load` just initializes the bot to be displayed when you open the chat
  */
  return {
      init: displayBot,
      load: initBot,
      openChat: openChat,
      closeChat:  __carlaEventHandlers.closeChat,
    };

})();