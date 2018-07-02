from node:8

# Add repo into container
ADD . /src
WORKDIR /src

# allows us to use PRIV_KEY
RUN mkdir /root/.ssh/
COPY id_rsa /root/.ssh/id_rsa
RUN chmod 400 /root/.ssh/id_rsa
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts

ENV NODE_ENV=development

# Install dependencies
RUN yarn global add npm
RUN npm install

# Generate assets
RUN npm run prepublish

# Move assets to a release directory
RUN mkdir release
RUN cp botchat.js release/
RUN cp botchat.css release/
RUN cp samples/release/bot.html release/