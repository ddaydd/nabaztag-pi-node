const WebSocket = require("ws");

let client = null;
const ddp = {
  connect(address, protocols) {
    client = new WebSocket(address, protocols);
    return client;
  },
  send: function(json) {
    const s = JSON.stringify(json);
    // console.log('->', s);
    client.send(s);
  },
};

module.exports = ddp;