import WebSocket from 'ws';
import 'dotenv/config';

const {
  DISCORD_WEBHOOK,
  HUB_ID,
  AVATAR_ID,
  DISPLAY_NAME,
  INTERNAL_WEBSOCKET_URL,
  CDN_URL
} = process.env;

const connectPayload = ['5', '5', 'ret', 'phx_join', { 'hub_id': HUB_ID }];
const joinPayload = ["8", "8", `hub:${HUB_ID}`, "phx_join",
  {
    "profile": {
      "avatarId": AVATAR_ID,
      "displayName": DISPLAY_NAME
    },
    "push_subscription_endpoint": null,
    "auth_token": "",
    "perms_token": null,
    "context": {
      "mobile": false,
      "embed": false,
      "hmd": false
    },
    "hub_invite_id": null
  }
];
const heartbeatPayload = [null, "9", "phoenix", "heartbeat", {}];
let heartbeatNumber = 9;

const userMap = {};

const ws = new WebSocket(INTERNAL_WEBSOCKET_URL);

ws.on('error', console.error);

ws.on('close', function close(code, reason) {
  console.log(code, reason.toString());
});

ws.on('open', function open() {
  ws.send(JSON.stringify(connectPayload));
});

ws.on('message', function message(data) {
  const res = JSON.parse(data.toString());

  // Server responded to initial connect message, join the lobby
  if (res[0] == "5" && res[1] == "5") {
    ws.send(JSON.stringify(joinPayload));
    setInterval(() => {
      // Send heartbeats every 10 seconds to keep connection alive
      ws.send(JSON.stringify(heartbeatPayload));
      heartbeatNumber++;
      heartbeatPayload[1] = heartbeatNumber;
    }, 10000);
  } else if (res[0] == null && res[3] == "phx_reply") {
    // Heartbeat reply
    return;
  } else {
    switch (res[3]) {
      case "presence_diff":
        if (Object.keys(res[4].joins)[0] == Object.keys(res[4].leaves)[0]) return;

        const verb = Object.keys(res[4].joins).length > 0 ? 'joins' : 'leaves';
        const verbed = verb === 'joins' ? 'joined' : 'left';
        const sessionId = Object.keys(res[4][verb])[0];
        const displayName = Object.values(res[4][verb])[0].metas[0].profile.displayName;
        fetch(DISCORD_WEBHOOK, {
          method: 'POST',
          body: JSON.stringify({
            content: `**${displayName}** has ${verbed} the room.`
          }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (verb === 'joins') {
          userMap[sessionId] = displayName;
        } else {
          delete userMap[sessionId];
        }
        break;
      case "presence_state":
        if (Object.keys(res[4].length != Object.keys(userMap).length)) {
          // Hubert had to reconnect while people are already in the room,
          // so sync userMap with presence_state
          Object.entries(res[4]).forEach(user => {
            userMap[user[0]] = user[1].metas[0].profile.displayName;
          });
        }
        break;
      case "naf":
        break;
      case "nafr":
        if (!res[4].naf.includes(CDN_URL)) return;
        const naf = JSON.parse(res[4].naf);

        const img = naf.data.d[0].components[3].src;
        fetch(DISCORD_WEBHOOK, {
          method: 'POST',
          body: JSON.stringify({
            content: img
          }),
          headers: { 'Content-Type': 'application/json' }
        });
        break;
      case "message":
        const username = userMap[res[4].session_id];
        fetch(DISCORD_WEBHOOK, {
          method: 'POST',
          body: JSON.stringify({
            content: `**${username}:** ${res[4].body}`
          }),
          headers: { 'Content-Type': 'application/json' }
        });
    }
  }
});
