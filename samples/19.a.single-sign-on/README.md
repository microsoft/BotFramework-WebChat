# Single sign-on demo for Web Chat

# Assumptions

- Developer have an existing web app that use OAuth sign-in
   - In our demo, we are using a React app
   - We assume the OAuth access token is live in the browser memory
      - Access token can live in browser memory but must be secured during transmit thru the use of TLS
      - More about security considerations can be found at [IETF RFC 6749 Section 10.3](https://tools.ietf.org/html/rfc6749#section-10.3)
- Developer know how to alter existing JavaScript code around OAuth sign-in UI and flow
- Developer added Web Chat to their web app thru ~`npm install`~ `<script>` tag

# Goals

- End-user is able to sign in thru the web app, and recognized by the bot immediately
- End-user is able to sign in thru the bot, and recognized by the web page immediately
- OAuth access token is saved as part of conversation or user state

# Mechanics

In this demo, we use DOM event to trigger authentication flow.

# Caveats

## More than one redirect URIs

In order to use the website to sign in, the developer will need to set redirect URI to their own web API.

In order to use the bot to sign in, in the OAuth provider, the developer will need to set redirect URI to https://token.botframework.com/.auth/web/redirect.

Most OAuth provider, does not support multiple redirect URIs. Thus, we need to use redirect URI from web API to make sure existing flows are not disturbed.
