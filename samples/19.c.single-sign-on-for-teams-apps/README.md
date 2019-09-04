# Single sign-on demo for Microsoft Teams apps using OAuth

[![Deploy Status](https://fuselabs.vsrm.visualstudio.com/_apis/public/Release/badge/531382a8-71ae-46c8-99eb-9512ccb91a43/12/12)](https://webchat-sample-sso-teams.azurewebsites.net/)

# Description

In this demo, we will show you how to authorize a user to access resources through a Microsoft Teams app with a bot. We will use [Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/) for OAuth provider and [Microsoft Graph](https://developer.microsoft.com/en-us/graph/) for the protected resources.

After sign-in, this demo will keep OAuth token inside the Teams tab, and also send it to the bot via Web Chat backchannel. Because both web page and bot need to hold a single OAuth token, we are unable to use OAuth card in this demo.

> When dealing with personal data, please respect user privacy. Follow platform guidelines and post your privacy statement online.

## Background

This sample is a simplified and reduced version of the sample "[Single sign-on demo for enterprise apps using OAuth](https://microsoft.github.io/BotFramework-WebChat/19.a.single-sign-on-for-enterprise-apps)" and modified from "[Single sign-on demo for Intranet apps using OAuth](https://microsoft.github.io/BotFramework-WebChat/19.b.single-sign-on-for-intranet-apps)". There are notable differences:

-  In this demo, we are targeting Microsoft Teams "tab apps", which is a set of web pages browsed through an embedded and limited web browser inside Microsoft Teams
   -  **Tab apps are supported on desktop client only.** Microsoft Teams on mobile client do not support embed content in apps and requires external apps for tab content
      - See "[Tabs on mobile clients](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/tabs/tabs-requirements#tabs-on-mobile-clients)" for more information
   -  OAuth sign-in popup is controlled by Microsoft Teams
      - See "[Authenticate a user in a Microsoft Teams tab](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/auth-tab-AAD)" for more information
-  We will only allow an authenticated user access to the page and the bot
-  Since we only allow authenticated access
   -  We no longer have UI buttons for sign-in and sign-out, and only use plain HTML instead of a React app
   -  We no longer send the sign-in and sign-out event activity to the bot
-  We only support a single [OAuth 2.0](https://tools.ietf.org/html/rfc6749)) provider; in this demo, we are using [Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/)
   -  Azure Active Directory supports PKCE ([RFC 7636](https://tools.ietf.org/html/rfc7636)), which we are using PKCE to simplify setup
   -  If you are using GitHub or other OAuth providers that do not support PKCE, you should use a client secret

This demo does not include any threat models and is designed for educational purposes only. When you design a production system, threat-modelling is an important task to make sure your system is secure and provide a way to quickly identify potential source of data breaches. IETF [RFC 6819](https://tools.ietf.org/html/rfc6819) and [OAuth 2.0 for Browser-Based Apps](https://tools.ietf.org/html/draft-ietf-oauth-browser-based-apps-01#section-9) is a good starting point for threat-modelling when using OAuth 2.0.

# How to run locally

This demo integrates with Azure Active Directory and Microsoft Teams. You will need to set it up in order to host the demo.

1. [Start ngrok tunnel for Microsoft Teams app](#start-ngrok-tunnel-for-microsoft-teams-app)
1. [Clone the code](#clone-the-code)
1. [Setup OAuth via Azure Active Directory](#setup-oauth-via-azure-active-directory)
1. [Setup Azure Bot Services](#setup-azure-bot-services)
1. [Setup a new Microsoft Teams app and install it locally](#setup-a-new-microsoft-teams-app-and-install-it-locally)
1. [Prepare and run the code](#prepare-and-run-the-code)

## Start ngrok tunnel for Microsoft Teams app

Since Microsoft Teams only supports `https://` addresses, we will be using ngrok tunnel to provide a temporary HTTPS tunnel for this demo.

1. Download [ngrok](https://ngrok.com/)
1. Run `ngrok http 5000`
1. Write down the Microsoft Teams app tunnel URL in this step
   - In the steps below, we will refer this URL as https://a1b2c3d4.ngrok.io/
   - You should replace it with the tunnel URL you obtained from this step

## Clone the code

To host this demo, you will need to clone the code and run locally.

1. Clone this repository
1. Create two files for environment variables, `/bot/.env` and `/web/.env`
   -  In `/web/.env`:
      -  Write `OAUTH_REDIRECT_URI=https://a1b2c3d4.ngrok.io/api/oauth/callback`
         -  When Azure Active Directory completes the authorization flow, it will send the browser to this URL. This URL must be accessible by the browser from the end-user machine
      -  Write `PROXY_BOT_URL=http://localhost:3978`
         -  This will forward all traffic from https://a1b2c3d4.ngrok.io/api/messages to http://localhost:3978/api/messages, where your bot is listening to

## Setup OAuth via Azure Active Directory

-  Go to your [Azure Active Directory](https://ms.portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview)
-  Create a new application
   1. Select "App registrations"
   1. Click "New registration"
   1. Fill out "Name", for example, "Web Chat SSO Sample"
   1. In "Redirect URI (optional)" section, add a new entry
      1. Select "Public client (mobile & desktop)" as type
         -  Instead of client secret, we are using PKCE ([RFC 7636](https://tools.ietf.org/html/rfc7636)) to exchange for authorization token, thus, we need to set it to ["Public client" instead of "Web"](https://docs.microsoft.com/en-us/azure/active-directory/develop/v1-protocols-oauth-code#use-the-authorization-code-to-request-an-access-token)
      1. Enter `http://a1b2c3d4.ngrok.io/api/oauth/callback` as the redirect URI
         -  This must match `OAUTH_REDIRECT_URI` in `/web/.env` we saved earlier
   -  Click "Register"
-  Save the client ID
   1. Select "Overview"
   1. On the main pane, copy the content of "Application (client) ID" to `/web/.env`, it should looks be a GUID
      -  `OAUTH_CLIENT_ID=12345678abcd-1234-5678-abcd-12345678abcd`

## Setup Azure Bot Services

> We prefer using [Bot Channel Registration](https://ms.portal.azure.com/#create/Microsoft.BotServiceConnectivityGalleryPackage) during development. This will help you diagnose problems locally without deploying to the server and speed up development.

> Since we already setup `PROXY_BOT_URL` in our web server `/web/.env` in "[Clone the code](#clone-the-code)" step, we can reuse the same ngrok tunnel. It will forward traffic from the web server to the bot.

You can follow our instructions on how to [setup a new Bot Channel Registration](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration?view=azure-bot-service-3.0). Points the messaging URL to https://a1b2c3d4.ngrok.io/api/messages.

1. Save the Microsoft App ID and password to `/bot/.env`
   -  `MICROSOFT_APP_ID=12345678-1234-5678-abcd-12345678abcd`
   -  `MICROSOFT_APP_PASSWORD=a1b2c3d4e5f6`
1. Save the Web Chat secret to `/web/.env`
   -  `DIRECT_LINE_SECRET=a1b2c3.d4e5f6g7h8i9j0`

> When you are building your production bot, never expose your Web Chat or Direct Line secret to the client. Instead, you should use the secret to generate a limited token and send it to the client. For information, please refer [generating a Direct Line token](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0#generate-token) and [Enhanced Direct Line Authentication feature](https://blog.botframework.com/2018/09/25/enhanced-direct-line-authentication-features/).

## Setup a new Microsoft Teams app and install it locally

> This section is based on the Microsoft Teams article named "[Add tabs to Microsoft Teams apps](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/tabs/tabs-overview)".

1. [Install App Studio app on Microsoft Teams](https://aka.ms/InstallTeamsAppStudio)
1. In the App Studio, switch to "Manifest editor" tab
1. Click "+ Create a new app" button
1. Fill out "App details" under "Details", for example:
   1. For "App names", enter "Web Chat SSO"
   1. Under "Identification"
      1. Click "Generate" button on "App ID"
      1. For "Package Name", enter "com.mycompany.bot.sso"
      1. For "Version", enter "1.0.0"
   1. Under "Descriptions"
      1. For both "Short description" and "Long description", enter "Company landing page with Web Chat and Single Sign-On"
   1. Under "Developer information"
      1. For "Name", enter "My Company"
      1. For "Website", enter `https://mycompany.com/`
   1. Under "App URLs"
      1. For "Privacy statement", enter `https://mycompany.com/privacy.html`
      1. For "Terms of use", enter `https://mycompany.com/termsofuse.html`
1. Fill out "Tabs" under "Capabilities"
   1. On "Add a personal tab" section, click "Add"
      1. For "Name", enter "My Company"
      1. For "Entity ID", enter "webchat"
      1. For "Content URL", enter `https://a1b2c3d4.ngrok.io/`
         - This URL will be based on the ngrok tunnel you create in "[Start ngrok tunnel](#start-ngrok-tunnel)" section
      1. Click "Save" button
1. Under "Test and distribute" of "Finish" section
   1. Click "Install" button
   1. On the "Web Chat SSO" dialog, click "Install" button again

## Prepare and run the code

1. Under both the `bot`, and `web` folder, run the following:
   1. `npm install`
   1. `npm start`
1. In Microsoft Teams, open the new app you just created in the "[Setup a new Microsoft Teams app and install it locally](#setup-a-new-microsoft-teams-app-and-install-it-locally)" step
   1. Click "..." on the navigation bar below "Files"
   1. Click "Web Chat SSO"
   1. Click "My Company" tab

# Things to try out

-  When you open the tab in the app for the first time, the tab should automatically popup an Azure Active Directory sign-in dialog
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
   -  Checks your access token or open a pop-up to OAuth provider if it is not present or valid
      -  The pop-up is provided by [Microsoft Teams JavaScript client SDK](https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client)
   -  Is integrated with Web Chat and piggybacks your OAuth access token on every user-initiated activity through `channelData.oauthAccessToken`
-  Bot
   -  On every message, it will extract the OAuth access token and obtain user's full name from Microsoft Graph

## Assumptions

-  Developer understand and has hands-on experience on creating a Microsoft Teams app for tab apps
-  Developer has an existing Intranet web app that uses OAuth to access protected resources
   -  We assume the OAuth access token lives in the browser's memory and is accessible through JavaScript
      -  Access token can live in browser memory but must be secured during transmit through the use of TLS
      -  More about security considerations can be found at [IETF RFC 6749 Section 10.3](https://tools.ietf.org/html/rfc6749#section-10.3)
   -  We assume the web app can be hosted as a tab under Microsoft Teams app

## Goals

-  Website and bot conversation supports authenticated access only
   -  If the end-user is not authenticated or does not carry a valid authenticated token, a sign-in dialog will appear
   -  This website resembles a company landing page, in which authenticated content (e.g. vacation balance) and bot conversation is required to co-exist on the same page
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
OAUTH_REDIRECT_URI=https://a1b2c3d4.ngrok.io/api/oauth/callback
DIRECT_LINE_SECRET=a1b2c3.d4e5f6g7h8i9j0
PROXY_BOT_URL=http://localhost:3978
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
-  [Microsoft Teams: Add tabs to Microsoft Teams apps](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/tabs/tabs-overview)
-  [Microsoft Teams: Authenticate a user in a Microsoft Teams tab](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/auth-tab-AAD)
-  [Microsoft Teams: Tabs on mobile clients](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/tabs/tabs-requirements#tabs-on-mobile-clients)

## OAuth access token vs. refresh token

To make this demo simpler, we are obtaining the access token via Authorization Code Grant flow instead of the refresh token. Access token is short-lived and considered secure to live inside the browser.

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

## Microsoft Teams: Personal tab vs. team tab

-  Personal tabs are tabs that are shown in the Microsoft Teams app only, i.e. only visible for the current user
-  Team tabs are tabs that are configured on a per-conversation basis, i.e. tab will be shown in a conversation with one or more team members

Because team tabs are designed to be used collaboratively by two or more users, content shown inside the team tab should be synchronized in terms of content and interactions. For example, a tab showing Microsoft Excel web app that two or more users can collaboratively edit the content.

For content that is not designed to be used by multiple users at the same time (for example, conversation with a bot), this type of content should be limited to personal tab only to reduce confusion.
