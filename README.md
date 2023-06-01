# Duckie

Duckie is a lightweight alternative to the official Hubs Discord bot. It was designed to work with a personal Hubs Cloud instance, but theoretically should work on hubs.mozilla.com as well (likely with some digging and tweaking for the correct values). It can connect to a Hubs room and will post join/leave messages, chat, and images to a Discord server via webhook.

Please keep in mind that I am no way officially affiliated with Hubs, nor am I a member of the Hubs team. This bot was the result of few hours poking around and parsing messages from Reticulum to replicate the official Hubs bot functionality without requiring OAuth on room join.

## Usage

Before starting, you will need to create a `.env` file and fill in the following values:

```sh
# Self-explanatory, retrieved from your Discord server settings
DISCORD_WEBHOOK=""
# The identifier of your Hubs room (https://yourhub.com/<HUB_ID>/hubs-room)
HUB_ID=""
# The identifier of the default avatar for your Hubs instance (https://yourhub.com/avatars/<AVATAR_ID>)
# I don't think this one is super important.
AVATAR_ID=""
# Self-explanatory, what the bot name will appear as
DISPLAY_NAME=""
# The internal websocket URL used to connect to Reticulum.
# If unsure, you can find this by checking your network tab when you load up a room.
INTERNAL_WEBSOCKET_URL=""
# The base URL for the CDN where your content is served.
# If unsure, you can find this by checking your network tab when you load up a room.
CDN_URL=""
```

Once you have your `.env` file, you can just setup and run the bot like so:

```sh
npm i
npm start
```
