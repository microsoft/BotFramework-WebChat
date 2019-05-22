# Single sign-on demo for enterprise apps

In this demo, we will show you how to authorize a user to access resources on an enterprise app with a bot. Two types of resources are used to demonstrate the interoperability of OAuth: [Microsoft Graph](https://developer.microsoft.com/en-us/graph/) and [GitHub API](https://developer.github.com/v3/).

You can browse to https://webchat-sso.azurewebsites.net/ to try out this demo.

# Background

Different companies may use different access delegation technologies to protect their resources. In our demo, we are targeting OAuth 2.0 ([RFC 6749](https://tools.ietf.org/html/rfc6749)).

Although OAuth and [OpenID](https://openid.net/) are often related to each other, they solve different problems. OAuth is for authorization and access delegation, while OpenID is for authentication and user identity.

Instead of OpenID, most enterprise apps use OAuth plus a graph API to identify an individual user. In this demo, we will demonstrate how to use OAuth to obtain access to graph API and use the API to identifying the accessor.

This demo does not include any threat models and is designed for educational purpose only. When you design a production system, threat-modelling is an important task to make sure your system is secure and provide a way to quickly identify potential source of data breaches. IETF [RFC 6819](https://tools.ietf.org/html/rfc6819) is a good starting point for threat-modelling when using OAuth 2.0.

# Assumptions

- Developer has an existing enterprise web app that uses OAuth to access protected resources
   - We assume the OAuth access token lives in the browser's memory and is accessible using JavaScript
      - Access token can live in browser memory but must be secured during transmit thru the use of TLS
      - More about security considerations can be found at [IETF RFC 6749 Section 10.3](https://tools.ietf.org/html/rfc6749#section-10.3)
- Developer know how to alter existing JavaScript code around their existing UI for OAuth

# Goals

- Website supports both anonymous and authenticated access. Forced page refresh and/or new conversation is not mandated
- End-user is able to sign in through the web page, and is recognized by the bot immediately
- End-user is able to sign in through the bot, and is recognized by the web page immediately
- End-user is able to sign in through the web page and sign out though the bot
- End-user is able to sign in through the bot and sign out through the web page
- OAuth access token is saved as part of the conversation state or user state

# How to run this demo

> For quickstart, you can browse to https://webchat-sso.azurewebsites.net/ to try out this demo in our hosted environment.

This demo integrates with multiple services. There are multiple services you need to setup in order to host the demo.

1. [Clone the code](#clone-the-code)
1. [Setup OAuth via Azure Active Directory](#setup-oauth-via-azure-active-directory)
1. [Setup OAuth via GitHub](#setup-oauth-via-github)
1. [Setup Azure Bot Services](#setup-azure-bot-services)
1. [Prepare and run the code](#prepare-and-run-the-code)

## Clone the code

To host this demo, you will need to clone the code and run locally.

1. Clone this repository
1. Create two files for environment variables, `/bot/.env` and `/rest-api/.env`
   - In `/rest-api/.env`:
      - Write `AAD_OAUTH_REDIRECT_URI=http://localhost:3000/api/aad/oauth/callback`
         - When Azure Active Directory completes the authorization flow, it will send the browser to this URL. This URL must be accessible by the browser from the end-user machine
      - Write `GITHUB_OAUTH_REDIRECT_URI=http://localhost:3000/api/github/oauth/callback`
         - Same as Azure Active Directory, this is the URL for GitHub to send its result

## Setup OAuth via Azure Active Directory

If you want to authenticate on Azure Active Directory, follow the steps below.

- Go to your [Azure Active Directory](https://ms.portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview)
- Create a new application
   1. Select "App registrations"
   1. Click "New registration"
   1. Give it a name
   1. In "Redirect URI (optional)" section, add a new entry
      1. Select "web" as type
      1. Enter `http://localhost:3000/api/aad/oauth/callback` as the redirect URI
         - This must match `AAD_OAUTH_REDIRECT_URI` in `/rest-api/.env` we saved earlier
   - Click "Register"
- Save the authorization endpoints
   1. Select "Overview"
   1. Click "Endpoints" on the main pane
   1. Copy the content of "OAuth 2.0 authorization endpoint (v2)" to `/rest-api/.env`
      - `AAD_OAUTH_AUTHORIZE_URL=https://login.microsoftonline.com/12345678-1234-5678-abcd-12345678abcd/oauth2/v2.0/authorize`
   1. Copy the content of "OAuth 2.0 token endpoint (v2)" to `/rest-api/.env`
      - `AAD_OAUTH_ACCESS_TOKEN_URL=https://login.microsoftonline.com/12345678-1234-5678-abcd-12345678abcd/oauth2/v2.0/token`
- Save the client ID
   1. Select "Overview"
   1. On the main pane, copy the content of "Application (client) ID" to `/rest-api/.env`
      - `AAD_OAUTH_CLIENT_ID=12345678abcd-1234-5678-abcd-12345678abcd`
- Save the client secret
   1. Select "Certificates & secrets"
   1. In the "Client secrets" section, create a "New client secret"
   1. Save the client secret to `/rest-api/.env` file
      - `AAD_OAUTH_CLIENT_SECRET=<your app client secret>`
- Enable "Implicit Grant" flow
   1. Select "Authentication"
   1. In the "Advanced Settings" section, check "Access tokens"
   1. Click "Save" button to save the changes

## Setup OAuth via GitHub

If you want to authenticate on GitHub, follow the steps below.

1. Sign into GitHub
1. Create a new OAuth application
   1. Browse to https://github.com/settings/developers
   1. Select "OAuth Apps"
   1. Click "New OAuth App"
   1. Fill out "Application name" and "Homepage URL"
   1. In "Application callback URL", enter `http://localhost:3000/api/github/oauth/callback`
   1. Click "Register application"
1. Save the client ID and secret
   1. Copy the "Client ID" to `/rest-api/.env`
      - `GITHUB_OAUTH_CLIENT_ID=a1b2c3d`
   1. Copy the "Client Secret"
      - `GITHUB_OAUTH_CLIENT_SECRET=a1b2c3d4e5f6`

## Setup Azure Bot Services

> We prefer to use [Bot Channel Registration](https://ms.portal.azure.com/#create/Microsoft.BotServiceConnectivityGalleryPackage) during development. This will help you diagnose problems locally without deploying to the server and speed up development.

You can follow [our instructions](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration?view=azure-bot-service-3.0) here to setup a new Bot Channel Registration.

1. Save the Microsoft App ID and password to `/bot/.env`
   - `MICROSOFT_APP_ID=12345678-1234-5678-abcd-12345678abcd`
   - `MICROSOFT_APP_PASSWORD=a1b2c3d4e5f6`
1. Save the Web Chat secret to `/rest-api/.env`
   - `DIRECT_LINE_SECRET=a1b2c3.d4e5f6g7h8i9j0`

During development, you will run your bot locally. You can use [ngrok](https://ngrok.com/) to expose your bot server.

1. Run `ngrok http -host-header=localhost:3978 3978`
1. Update your Bot Channel Registration, you can use [AZ CLI](https://aka.ms/az-cli) or [Azure Portal](https://portal.azure.com)
   - Via AZ CLI
      - Run `az bot update --resource-group <your-bot-rg> --name <your-bot-name> --subscription <your-subscription-id> --endpoint "https://a1b2c3d4.ngrok.io/api/messages"`
   - Via Azure Portal
      - Browse to your Bot Channel Registration
      - Select "Settings"
      - In "Configuration" section, set "Messaging Endpoint" to `https://a1b2c3d4.ngrok.io/api/messages`

## Prepare and run the code

1. Under `app`, `bot`, and `rest-api` folder, run the following
   1. `npm install`
   1. `npm start`
1. Browse to http://localhost:3000/ to start the demo

# Frequently asked questions

## How can I reset my authorization?

In the demo, after you signed in, click the profile photo on upper-right hand corner, select "Review access on Office.com" or "Review access on GitHub". Then, you will be redirected to the OAuth provider page to remove your authorization.

- For GitHub, you can click the "Revoke access" button
- For Azure Active Directory
   1. In the dashboard page, wait until "App permissions" load, you see how many apps you authorized
   1. Click "Change app permissions"
   1. In the "You can revoke permission for these apps" section, click the "Revoke" button below your app registration

# Design considerations

## Organization of JavaScript code

In our demo, we built an enteprise single-page app using React. Then, we use `<script>` tag to embed Web Chat. This is for separating the code so developers reading this sample can study the changes and easier understanding the interactions between them.

You are not required to code your web app in React or use Web Chat via `<script>` tag. In fact, you can write both your web app and embed Web Chat using JavaScript or React.

### Wiring up components

Since the demo is running in a heterogeneous environment (both React and pure JavaScript), additional wire-ups are required. We use DOM events to wire up the enterprise app (authentication UI) and Web Chat.

In your production system, you are probably in an homogenous environment (either React or pure JavaScript), you may want to use Redux or other mechanisms to wire up different UI components.

## OAuth access token vs. refresh token

To make this demo simpler to understand, we are using access token, a.k.a. "Implicit Grant" flow, which the access token is consider as secure inside the browser.

In your production scenario, instead of access token, you may want to use refresh token, a.k.a. "Authorization Code Grant" flow. But this will increase the complexity of this demo because it requires server-to-server communications and secured persistent storage.

Since this demo is focused around the interactions between bot and web app, we prefer to use access token to keep the code easier to understand.

# Further studies

To reduce complexity and lower learning curve, this sample is limited in scope. In your production system, you should consider enhancing it and review its threat model.

- Using refresh token
   - Save the refresh token on the server side of your web app, never expose it to the browser or the bot
   - Bot accessing the resources will requires to obtain an access token from web app, and cached using conversation state
   - This will also smoothen UX by reducing the need of UI popups
- Threat-modelling
   - IETF [RFC 6819](https://tools.ietf.org/html/rfc6819) is a good starting point for threat-modelling when using OAuth 2.0

# Caveats

## More than one redirect URIs

In order to use the website to sign in, the developer will need to set redirect URI to their own web API.

In order to use the bot to sign in, in the OAuth provider, the developer will need to set redirect URI to https://token.botframework.com/.auth/web/redirect.

Some OAuth provider does not support multiple redirect URIs. Thus, we need to use redirect URI from web API to make sure existing flows are not disturbed.
