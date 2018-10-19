# Direct Line token server

You can use this simple web server to perform token exchange using Direct Line secret. Token is the recommended method to authenticate Web Chat against Direct Line service.

In this sample, we are leveraging GitHub, Travis CI, Docker, Azure Container Registry, and Azure Web App for Containers, to deploy the web server to Azure.

This is an advanced topic. You will need some basic understanding on these topics to proceed:

* Node.js
   * Restify
* Git and GitHub
* Travis CI
* Azure Web App for Containers
* Web security

This web server is a sample and is writing for demonstration purpose only. It _has not passed_ any security reviews. To use in production environment, you will need to address multiple security concerns. The list below is not exhaustive and it only give you some ideas of security concerns you need to review:

* Limit token using CORS
* Throttle token requests
* Log and audit every requests
* Rotate secret base on a schedule

Your Direct Line secret is very important. Please handle them carefully and treat them as a physical key to all your user data. If the key is exposed, you must regenerate them immediately.

# How to use

1. Create a new GitHub repository
1. Enable Travis CI for your repository
1. Create a new Azure Container Registry
   1. Enable admin user and write down the username and password
1. Add environment variables to Travis CI settings
   * `ACR_NAME` is the name of Azure Container Registry, will be appended with `.azurecr.io`
   * `DOCKER_IMAGE_NAME` is the name of the image
   * `DOCKER_PASSWORD` is the password of Azure Container Registry
   * `DOCKER_USERNAME` is the username of Azure Container Registry
1. Copy and commit source code from this directory to root of your GitHub repository
   * This will kick off a build on Travis CI
   * Verify the build is successful on Travis CI
   * Verify the Docker image is pushed to Azure Container Registry
1. Create a new Azure Web App for Containers
   * Click "Configure container"
      * Select "Single Container"
      * "Image source" set to "Azure Container Registry"
      * "Registry" set to your Azure Container Registry
      * "Image" set to your Docker image name
      * "Tag" set to "latest"
      * "Startup File" leaves as blank
      * Click "Apply" and start creating the Azure Web App
   * Verify your new Azure Web App has deployed correctly
1. Setup additional settings in your Azure Web App
   * Set up your Direct Line secret
      * Go to "Application settings"
        * Under "Application settings" section, add new settings
            * `DIRECT_LINE_SECRET` to your Direct Line secret
            * (Optional) `BING_SPEECH_SUBSCRIPTION_KEY` to your Bing Speech subscription key, if any
        * Click "Save"
   * Enable continuous deployment in your Azure Web App
      * Go to "Container settings"
         * Set "Continuous Deployment" to "On"
         * Click "Save"
      * Verify by going to Azure Container Registry, check if a new Webhook for the Azure Web App
   * (Optional) Improve application performance
      * Go to "Application settings"
         * Set "Always On" to "On"
            * The web server will run indefinitely even there are no requests queued, it will be restarted (via heartbeat) if the process is down
         * Set "ARR Affinitiy" to "Off"
            * This web server is stateless and does not requires sticky session
         * Click "Save"
1. Verify if the Azure Web App is deployed correctly
   * In Command Prompt or terminal, run `curl -d "" https://YOUR_AZURE_WEB_APP.azurewebsites.net/directline/token`
      * `curl` should return the token as part of a JSON
   * (Optional) For Bing Speech, run `curl -d "" https://YOUR_AZURE_WEB_APP.azurewebsites.net/bingspeech/token`

## Troubleshoot

1. Setup diagnostics logs
   * In Azure Web App, go to "Diagnostics logs"
      * Set "Application Logging" to "File System"
      * Click "Save"
1. Go to "Log stream"
   * You should see `restify listening to http://[::]:80`, this indicate the web server is running successfully
1. Request a Direct Line token thru `curl`
   * You should see `Requesting Direct Line token for undefined`, this indicate a client is requesting a token

# What's next

This is a minimal setup of a token server. In order to bring it to production, there are a few things you could consider.

## Direct Line user ID

Every time a token is requested, a new user ID and conversation ID will be generated.

If you are using this web server on your web site with user profiles, you may want to associate the Direct Line user ID and conversation ID to your user profile database. This will help the user to retrieve past conversation history.
