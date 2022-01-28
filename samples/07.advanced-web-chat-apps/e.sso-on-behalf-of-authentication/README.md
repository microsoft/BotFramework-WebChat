# Single sign-on demo for On Behalf Of Authentication using OAuth

# Description

In this demo, we will show you how to authorize a user to access resources on an enterprise app with a bot using [Microsoft Graph](https://developer.microsoft.com/en-us/graph/).

> When dealing with personal data, please respect user privacy. Follow platform guidelines and post your privacy statement online.

## Background

Different companies may use different access delegation technologies to protect their resources. In our demo, we are targeting authorization through [OAuth 2.0](https://tools.ietf.org/html/rfc6749)).

Although OAuth and [OpenID](https://openid.net/) are often related to each other, they solve different problems. OAuth is for authorization and access delegation, while OpenID is for authentication and user identity.

Instead of OpenID, most enterprise apps use OAuth plus a user profile API to identify an individual user. In this demo, we will demonstrate how to use OAuth to obtain access to user profile API and use the API to identifying the accessor.

This demo does not include any threat models and is designed for educational purposes only. When you design a production system, threat-modelling is an important task to make sure your system is secure and provide a way to quickly identify potential source of data breaches. IETF [RFC 6819](https://tools.ietf.org/html/rfc6819) and [OAuth 2.0 for Browser-Based Apps](https://tools.ietf.org/html/draft-ietf-oauth-browser-based-apps-01#section-9) is a good starting point for threat-modelling when using OAuth 2.0.

# How to run locally

This demo integrates with multiple services. There are multiple services you need to setup in order to host the demo.

1. [Clone the code](#clone-the-code)
2. [Setup OAuth via Azure Active Directory for the Web App](#setup-oauth-via-azure-active-directory-for-the-web-app)
3. [Setup OAuth via Azure Active Directory for the Bot](#setup-oauth-via-azure-active-directory-for-the-bot)
4. [Setup Azure Bot Services](#setup-azure-bot-services)
5. [Prepare and run the code](#prepare-and-run-the-code)

## Clone the code

To host this demo, you will need to clone the code and run locally.

1. Clone this repository
1. Create two files for environment variables, `/bot/.env` and `/rest-api/.env`
   -  In `/rest-api/.env`:
      -  Write `AAD_OAUTH_REDIRECT_URI=http://localhost:3000/api/aad/oauth/callback`
         -  When Azure Active Directory completes the authorization flow, it will send the browser to this URL. This URL must be accessible by the browser from the end-user machine

## Setup OAuth via Azure Active Directory for the Web App

-  Go to your [Azure Active Directory](https://ms.portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview)
-  Create a new application
   1. Select "App registrations"
   2. Click "New registration"
   3. Fill out "Name", for example, "Web Chat On-Behalf-Of Sample"
   4. In "Redirect URI (optional)" section, add a new entry
      1. Select "Web" as type
      2. Enter `http://localhost:3000/api/aad/oauth/callback` as the redirect URI
         -  This must match `AAD_OAUTH_REDIRECT_URI` in `/rest-api/.env` we saved earlier
   -  Click "Register"
-  Save the client and tenant ID
   1. Select the "Overview" blade
   1. On the main pane, copy the content of "Application (client) ID" and "Directory (tenant) ID" to `/rest-api/.env`, it should looks be a GUID
      -  `AAD_OAUTH_CLIENT_ID=12345678abcd-1234-5678-abcd-12345678abcd`
      -  `AAD_OAUTH_TENANT_ID=abcd1234-abcd-1234-efgh-5678abcdefgh`
-  Update App Registration Manifest
   1. Select the "Manifest" blade
      1. Set `accessTokenAcceptedVersion` to `2`
      2. Set `oauth2AllowImplicitFlow` to `true`
-  Enable ID Tokens
   1. Select the "Authentication" Blade
      1. Towards the bottom of the "Web" section, check the box next to "ID tokens" under "Implicit grant"

## Setup OAuth via Azure Active Directory for the Bot

-  Go to your [Azure Active Directory](https://ms.portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview)
-  Create a new application
   1. Select "App registrations"
   2. Click "New registration"
   3. Fill out "Name", for example, "Web Chat On-Behalf-Of Sample"
   4. In "Redirect URI (optional)" section, add a new entry
      1. Select "Web" as type
      2. Enter `https://token.botframework.com/.auth/web/redirect` as the redirect URI
   -  Click "Register"
-  Update App Registration Manifest
   1. Select the "Manifest" blade
      1. Set `accessTokenAcceptedVersion` to `2`
-  Create a new client secret
   1. Select the "Certificates & secretes" blade
   2. Click the "New client secret"
-  Add a scope and client application
   1. Select the "Expose an API" blade
      1. Add a new scope for the bot
         1. Click the "Add a scope" button under "Scopes defined by this API"
            1. Click "Save and continue"
            1. Add a scope name
            1. Set "Who can consent?" to "Admins and users"
            1. Add an admin consent display name
            1. Add an admin consent description
            1. Click "Add scope"
            1. Save the Scope URL to configure authentication for the bot in the Bot Registration in the next section
               -  api://123a45b6-789c-01de-f23g-h4ij5k67a8bc/scope
      2. Add a client application
         1. Click the "Add a client application" under "Authorized client applications"
            1. Set the client id to the Web Applications client id (i.e. AAD_OAUTH_CLIENT_ID from above)
            2. Check the box next to the scope we added in the previous step under "Authorized scopes"
            3. Click "Add application"

## Setup Azure Bot Services

> We prefer using [Bot Channel Registration](https://ms.portal.azure.com/#create/Microsoft.BotServiceConnectivityGalleryPackage) during development. This will help you diagnose problems locally without deploying to the server and speed up development.

You can follow our instructions on how to [setup a new Bot Channel Registration](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration?view=azure-bot-service-3.0).

1. Add OAuth Connection for the bot to the Bot Channel Registration
   1. In the Bot Channel Registration open the settings blade
   2. Under "OAuth Connection Settings" click the "Add Setting" button
      1. Add new Connection Setting
         1. Set the connection "name"
         2. Set the "Service Provider" to "Azure Active Directory 2"
         3. Add the Client ID, Client secret, and Tenant ID from [setting up the OAuth connection for the Bot](#setup-oauth-via-azure-active-directory-for-the-bot)
         4. Set the "Token Exchange URL" to the scope URL that was created in the previous section
            -  api://123a45b6-789c-01de-f23g-h4ij5k67a8bc/scope
         5. Set the "Scopes" field to the scopes you want the bot to have permission to access (ie. user.read)
2. Save the Microsoft App ID, password, and OAuth connection name to `/bot/.env`
   -  `MicrosoftAppId=12345678-1234-5678-abcd-12345678abcd`
   -  `MicrosoftAppPassword=12345678`
   -  `connectionName=botOAuthConnection`
3. Save the Web Chat secret to `/rest-api/.env`
   -  `DIRECT_LINE_SECRET=abcdefghijk.abcdefghijklmnopqrstuvwxyz`

> When you are building your production bot, never expose your Web Chat or Direct Line secret to the client. Instead, you should use the secret to generate a limited token and send it to the client. For information, please refer [to this page on how to generate a Direct Line token](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0#generate-token) and [Enhanced Direct Line Authentication feature](https://blog.botframework.com/2018/09/25/enhanced-direct-line-authentication-features/).

During development, you will run your bot locally. Azure Bot Services will send activities to your bot through a public URL. You can use [ngrok](https://ngrok.com/) to expose your bot server on a public URL.

1. Run `ngrok http -host-header=localhost:3978 3978`
1. Update your Bot Channel Registration. You can use [Azure CLI](https://aka.ms/az-cli) or [Azure Portal](https://portal.azure.com)
   -  Via Azure CLI
      -  Run `az bot update --resource-group <your-bot-rg> --name <your-bot-name> --subscription <your-subscription-id> --endpoint "https://a1b2c3d4.ngrok.io/api/messages"`
   -  Via Azure Portal
      -  Browse to your Bot Channel Registration
      -  Select "Settings"
      -  In "Configuration" section, set "Messaging Endpoint" to `https://a1b2c3d4.ngrok.io/api/messages`

## Prepare and run the code

1. Under `app`, `bot`, and `rest-api` folder, run the following:
   1. `npm install`
   1. `npm start`
1. Browse to http://localhost:3000/ to start the demo

# Things to try out

-  Notice there is a sign-in button on top-right hand corner
-  Send any message to bot
   -  If you are not logged into the website, Web Chat will notify you to sign in.
   -  Once you are signed in Web Chat will notify you to authorize the bot to access your account.
-  Send 'logout' to the bot to sign out of the bot and the website

Note, the first time the user authenticates the bot, they will have to sign in directly to the bot as well as the website. After this first interaction, the user can simply grant the bot access to their information without having to authenticate the bot again.

# Code

-  `/app/` is the React app built using `create-react-app` scaffold
-  `/bot/` is the bot server
-  `/rest-api/` is the REST API for handling OAuth requests
   -  `GET /api/aad/oauth/callback` will handle callback from Azure AD OAuth
   -  `GET /api/aad/settings` will send Azure AD OAuth settings to the React app
   -  `GET /api/directline/token` will generate a new Direct Line token for the React app
   -  It will serve React app as a static content
   -  During development-time, it will also serve the bot server via `/api/messages`
      -  To enable this feature, add `PROXY_BOT_URL=http://localhost:3978` to `/web/.env`
      -  This will forward all traffic from `https://a1b2c3d4.ngrok.io/api/messages` to `https://localhost:3978/api/messages`

# Overview

## Assumptions

-  Developer has an existing enterprise web app that uses OAuth to access protected resources
   -  We assume the website uses the [`MSAL.js`](https://www.npmjs.com/package/msal) npm package to authenticate users

## Goals

-  Website and bot conversation supports both anonymous and authenticated access
   -  Forced page refresh and/or new conversation is not mandated
-  End-user is able to sign in through the web page, and is recognized by the bot immediately
   -  Vice versa, end-user is able to sign in through the bot, and is recognized by the web page immediately
-  End-user is able to sign in through the web page and sign out though the bot
   -  Vice versa, end-user is able to sign in through the bot and sign out through the web page

## Content of the `.env` files

The `.env` files hold the environment variables critical to run the service. These are usually security-sensitive information and must not be committed to version control. Although we recommend keeping these keys in Azure Vault, for simplicity of this sample, we would keep them in `.env` files.

To ease the setup of this sample, here is the template of `.env` files.

### `/bot/.env`

```
MicrosoftAppId=12345678-1234-5678-abcd-12345678abcd
MicrosoftAppPassword=12345678
connectionName=botOAuthConnection
```

### `/rest-api/.env`

```
AAD_OAUTH_CLIENT_ID=12345678abcd-1234-5678-abcd-12345678abcd
AAD_OAUTH_REDIRECT_URI=http://localhost:3000/api/aad/oauth/callback
AAD_OAUTH_TENANT_ID=abcd1234-abcd-1234-efgh-5678abcdefgh
DIRECT_LINE_SECRET=abcdefghijk.abcdefghijklmnopqrstuvwxyz
```

## OAuth provider support single redirect URI only

In this sample, we do not use OAuth card due to technical limitations on some OAuth providers which support single redirect URI only.

In order to use the website to sign in, the developer will need to set the redirect URI to their own web API.

In order to use the bot to sign in, in the OAuth provider, the developer will need to set the redirect URI to https://token.botframework.com/.auth/web/redirect.

Since some OAuth providers do not support multiple redirect URIs, we prefer using a single redirect URI from the web API to make sure existing authorization flow is not disturbed.

# Frequently asked questions

## How can I reset my authorization?

After having signed in on this app, click the profile photo on the upper-right hand corner, select "Review access on Office.com". Then, you will be redirected to the OAuth provider page to remove your authorization.

1. On the AAD dashboard page, wait until "App permissions" loads. Here you see how many apps you have authorized
1. Click "Change app permissions"
1. In the "You can revoke permission for these apps" section, click the "Revoke" button below your app registration

# Further reading

## Related articles

-  [Microsoft identity platform and OAuth 2.0 On-Behalf-Of flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow)
-  [RFC 6749: The OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
-  [RFC 6819: OAuth 2.0 Threat Model and Security Considerations](https://tools.ietf.org/html/rfc6819)
-  [RFC 7636: Proof Key for Code Exchange by OAuth Public Clients](https://tools.ietf.org/html/rfc7636)
-  [IETF Draft: OAuth 2.0 for Browser-Based Apps](https://tools.ietf.org/html/draft-ietf-oauth-browser-based-apps-01)
-  [Bot Framework Blog: Enhanced Direct Line Authentication feature](https://blog.botframework.com/2018/09/25/enhanced-direct-line-authentication-features/)

## Threat model

To reduce complexity, this sample is limited in scope. In your production system, you should consider enhancing it and review its threat model.

-  Refreshing the access token
   -  Using silent prompt for refreshing access token
      -  Some OAuth providers support `?prompt=none` for refreshing access token silently through `<iframe>`
   -  Using Authorization Code Grant flow with refresh token
      -  Save the refresh token on the server side of your web app. Never expose it to the browser or the bot
      -  This will also create a smooth UX by reducing the need for UI popups
-  Threat model
   -  IETF [RFC 6819](https://tools.ietf.org/html/rfc6819) is a good starting point for threat-modelling when using OAuth 2.0

## Mixed conversations

To lower the barrier for the end-user to initiate a conversation with the bot, in this sample, the conversation can be both anonymous or authenticated.

That means at some points of time, the mixed conversation can be authenticated as different users. If it is not a desirable scenario for your use case, you might want to create a new conversation if the user signed out.
