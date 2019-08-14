# Single sign-on demo for Intranet apps using OAuth

[![Deploy Status](https://fuselabs.vsrm.visualstudio.com/_apis/public/Release/badge/531382a8-71ae-46c8-99eb-9512ccb91a43/9/9)](https://webchat-sample-sso-intranet.azurewebsites.net/)

# Description

In this demo, we will show you how to authorize a user to access resources on an Intranet app with a bot. We will use [Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/) for OAuth provider and [Microsoft Graph](https://developer.microsoft.com/en-us/graph/) for the protected resources.

> When dealing with personal data, please respect user privacy. Follow platform guidelines and post your privacy statement online.

## Background

This sample is a simplified and reduced version of the sample "[Single sign-on demo for enterprise apps using OAuth](https://microsoft.github.io/BotFramework-WebChat/19.a.single-sign-on-for-enterprise-apps)". There are notable differences:

-  In this demo, we are targeting a traditional web page instead of single-page application
   -  Page navigation and refresh are allowed on a traditional web page, but are restricted on a single-page application
-  We will only allow an authenticated user access to the page and the bot
-  Since we only allow authenticated access
   -  We no longer have UI buttons for sign-in and sign-out, and only use plain HTML instead of a React app
   -  We no longer send the sign-in and sign-out event activity to the bot
-  We only support a single [OAuth 2.0](https://tools.ietf.org/html/rfc6749)) provider; in this demo, we are using [Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/)
   -  Azure Active Directory supports PKCE ([RFC 7636](https://tools.ietf.org/html/rfc7636)), which we are using PKCE to simplify setup
   -  If you are using GitHub or other OAuth providers that do not support PKCE, you should use a client secret

This demo does not include any threat models and is designed for educational purposes only. When you design a production system, threat-modelling is an important task to make sure your system is secure and provide a way to quickly identify potential source of data breaches. IETF [RFC 6819](https://tools.ietf.org/html/rfc6819) and [OAuth 2.0 for Browser-Based Apps](https://tools.ietf.org/html/draft-ietf-oauth-browser-based-apps-01#section-9) is a good starting point for threat-modelling when using OAuth 2.0.

# Test out the hosted sample

You can browse to https://webchat-sample-sso-intranet.azurewebsites.net/ to try out this demo.

# How to run locally

This demo integrates with Azure Active Directory. You will need to set it up in order to host the demo.

1. [Clone the code](#clone-the-code)
1. [Setup OAuth via Azure Active Directory](#setup-oauth-via-azure-active-directory)
1. [Setup Azure Bot Services](#setup-azure-bot-services)
1. [Prepare and run the code](#prepare-and-run-the-code)

## Clone the code

To host this demo, you will need to clone the code and run locally.

1. Clone this repository
1. Create two files for environment variables, `/bot/.env` and `/web/.env`
   -  In `/web/.env`:
      -  Write `OAUTH_REDIRECT_URI=http://localhost:5000/api/oauth/callback`
         -  When Azure Active Directory completes the authorization flow, it will send the browser to this URL. This URL must be accessible by the browser from the end-user machine

## Setup OAuth via Azure Active Directory

If you want to authenticate on Azure Active Directory, follow the steps below.

-  Go to your [Azure Active Directory](https://ms.portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview)
-  Create a new application
   1. Select "App registrations"
   1. Click "New registration"
   1. Fill out "Name", for example, "Web Chat SSO Sample"
   1. In "Redirect URI (optional)" section, add a new entry
      1. Select "Public client (mobile & desktop)" as type
         -  Instead of client secret, we are using PKCE ([RFC 7636](https://tools.ietf.org/html/rfc7636)) to exchange for authorization token, thus, we need to set it to ["Public client" instead of "Web"](https://docs.microsoft.com/en-us/azure/active-directory/develop/v1-protocols-oauth-code#use-the-authorization-code-to-request-an-access-token)
      1. Enter `http://localhost:5000/api/oauth/callback` as the redirect URI
         -  This must match `OAUTH_REDIRECT_URI` in `/web/.env` we saved earlier
   -  Click "Register"
-  Save the client ID
   1. Select "Overview"
   1. On the main pane, copy the content of "Application (client) ID" to `/web/.env`, it should looks be a GUID
      -  `OAUTH_CLIENT_ID=12345678abcd-1234-5678-abcd-12345678abcd`

## Setup Azure Bot Services

> We prefer using [Bot Channel Registration](https://ms.portal.azure.com/#create/Microsoft.BotServiceConnectivityGalleryPackage) during development. This will help you diagnose problems locally without deploying to the server and speed up development.

You can follow our instructions on how to [setup a new Bot Channel Registration](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration?view=azure-bot-service-3.0).

1. Save the Microsoft App ID and password to `/bot/.env`
   -  `MICROSOFT_APP_ID=12345678-1234-5678-abcd-12345678abcd`
   -  `MICROSOFT_APP_PASSWORD=a1b2c3d4e5f6`
1. Save the Web Chat secret to `/web/.env`
   -  `DIRECT_LINE_SECRET=a1b2c3.d4e5f6g7h8i9j0`

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

1. Under both the `bot`, and `web` folder, run the following:
   1. `npm install`
   1. `npm start`
1. Browse to http://localhost:5000/ to start the demo

# Things to try out

-  Type, "Hello" in Web Chat
   -  The bot should be able to identify your full name by using your access token on Microsoft Graph

# Code

-  `/bot/` is the bot server
-  `/web/` is the REST API for handling OAuth requests
   -  `GET /api/oauth/authorize` will redirect to Azure AD OAuth authorize page at https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize
   -  `GET /api/oauth/callback` will handle callback from Azure AD OAuth
   -  `GET /api/directline/token` will generate a new Direct Line token for the React app
   -  It will serve a static `index.html`
   -  During development-time, it will also serve the bot server via `/api/messages`
      -  To enable this feature, add `PROXY_BOT_URL=http://localhost:3978` to `/web/.env`
      -  This will forward all traffic from `https://a1b2c3d4.ngrok.io/api/messages` to `https://localhost:3978/api/messages`

# Overview

This sample includes multiple parts:

-  A basic web page that:
   -  Checks your access token or redirects to OAuth provider if it is not present or valid
   -  Is integrated with Web Chat and piggybacks your OAuth access token on every user-initiated activity through `channelData.oauthAccessToken`
-  Bot
   -  On every message, it will extract the OAuth access token and obtain user's full name from Microsoft Graph

## Assumptions

-  Developer has an existing Intranet web app that uses OAuth to access protected resources
   -  We assume the OAuth access token lives in the browser's memory and is accessible through JavaScript
      -  Access token can live in browser memory but must be secured during transmit through the use of TLS
      -  More about security considerations can be found at [IETF RFC 6749 Section 10.3](https://tools.ietf.org/html/rfc6749#section-10.3)

## Goals

-  Website and bot conversation supports authenticated access only
   -  If the end-user is not authenticated or does not carry a valid authenticated token, they will be redirected to OAuth provider
-  Bot will receive OAuth access token from the website

## Content of the `.env` files

The `.env` files hold the environment variables critical to run the service. These are usually security-sensitive information and must not be committed to version control. Although we recommend keeping these keys in Azure Vault, for simplicity of this sample, we would keep them in `.env` files.

To ease the setup of this sample, here is the template of `.env` files.

### `/bot/.env`

```
MICROSOFT_APP_ID=12345678-1234-5678-abcd-12345678abcd
MICROSOFT_APP_PASSWORD=a1b2c3d4e5f6
```

### `/web/.env`

```
OAUTH_CLIENT_ID=12345678abcd-1234-5678-abcd-12345678abcd
OAUTH_REDIRECT_URI=http://localhost:5000/api/oauth/callback
DIRECT_LINE_SECRET=a1b2c3.d4e5f6g7h8i9j0
```

# Frequently asked questions

## How can I reset my authorization?

To reset application authorization, please follow the steps below.

1. On the [AAD dashboard page](https://portal.office.com/account/#apps), wait until "App permissions" loads. Here you see how many apps you have authorized
1. Click "Change app permissions"
1. In the "You can revoke permission for these apps" section, click the "Revoke" button below your app registration

# Further reading

## Related articles

-  [RFC 6749: The OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
-  [RFC 6819: OAuth 2.0 Threat Model and Security Considerations](https://tools.ietf.org/html/rfc6819)
-  [RFC 7636: Proof Key for Code Exchange by OAuth Public Clients](https://tools.ietf.org/html/rfc7636)
-  [IETF Draft: OAuth 2.0 for Browser-Based Apps](https://tools.ietf.org/html/draft-ietf-oauth-browser-based-apps-01)
-  [Bot Framework Blog: Enhanced Direct Line Authentication feature](https://blog.botframework.com/2018/09/25/enhanced-direct-line-authentication-features/)

## OAuth access token vs. refresh token

To make this demo simpler to understand, instead of refresh token, we are obtaining the access token via Authorization Code Grant flow. Access token is short-lived and considered secure to live inside the browser.

In your production scenario, you may want to obtain the refresh token with "Authorization Code Grant" flow instead of using the access token. We did not use the refresh token in this sample as it requires server-to-server communications and secured persistent storage, it would greatly increase the complexity of this demo.

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
