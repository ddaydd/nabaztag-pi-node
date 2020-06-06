const WebSocket = require("ws");
const fs = require('fs');
const nab = require('./helpers.js');

let methodId = 1;

// connexion socket à homedoudou
const fileId = 'homedoudouId.txt';
let homedoudouId = null;
if(fs.existsSync(fileId)) homedoudouId = fs.readFileSync('homedoudouId.txt', 'utf8');

let client = null;
const ddp = {
  connected: false,
  connect(address, protocols, options) {
    if(!homedoudouId) return console.log('homedoudouId.txt with identifiant missing');;
    client = new WebSocket(address, protocols, options);

    // eventListener
    client.on('message', function(data) {
      data = JSON.parse(data);
      // console.log('<-', data);
      if(data['server_id'] === '0') {
        ddp.send({
          msg: 'connect',
          version: '1',
          support: ['1', 'pre2', 'pre1'],
        });
      }

      if(data['msg'] === 'ping') {
        ddp.send({
          msg: 'pong',
        });
      }

      if(data['msg'] === 'connected') {
        ddp.connected = true;
        console.log('connected to ' + address);
        ddp.sendToHMD('connexion', 'hard_id', homedoudouId);
        ddp.sendToHMD('archive', 'infos', 'se connecte');
        ddp.sendToHMD('archive', 'vivant', '1');
        setInterval(function() {
          ddp.sendToHMD('archive', 'vivant', '1');
        }, 1000 * 60 * 10);
      }

      if(data['msg'] === 'command') {
        const command = data['command'];
        nab.sendToRabbit(command);
      }

      if(data['msg'] === 'error') {
        console.log('----------- ERROR --------', data['reason']);
        if(data['reason'] === "unknown_hard") console.log('----------- BAD ID HOMEDOUDOU --------');
      }

    });

    client.on('close', function() {
      console.log('--- close');

      ddp.connected = false;
      const reconnect = setTimeout(function() {
        if(ddp.connected)
          return clearTimeout(reconnect);
        else {
          console.log('--- try to reconnect');
          ddp.connect(address, protocols, options);
        }
      }, 1000 * 60);

    });

  },
  send: function(json) {
    const s = JSON.stringify(json);
    // console.log('->', s);
    client.send(s);
  },
  sendToHMD: function(m, k, v) {
    return ddp.sendToHMDMethod('ddpToHmd', {"m": m, "k": k, "v": v});
  },

  sendToHMDMethod: function(method, toSend) {
    ddp.send({"msg": "method", "id": methodId.toString(), "method": "" + method + "", "params": [toSend]}); // FIXME incremente id
    methodId++;
  },
};

module.exports = ddp;