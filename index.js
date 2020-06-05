/*
Created by David FAIVRE-MAÇON
https://www.davidfm.me

Serveur NODEJS pour nabaztag pi

Connexion homedoudou
https://www.homedoudou.fr

*/
//FIXME peripherique homedoudou tab
const version = 0.2;
// const host = '127.0.0.1:3000';
const host = 'hard.homedoudou.fr';

const fs = require('fs');
const handlebars = require('handlebars');
const ddp = require('./ddp.js');
const nab = require('./helpers.js');

// connexion socket à homedoudou
let homedoudouId = null;
try {
  homedoudouId = fs.readFileSync('homedoudouId.txt', 'utf8');
}
catch(e) {
  console.log('Error:', e.stack);
}
if(!homedoudouId) return console.log('homedoudouId.txt with identifiant missing');

const client = ddp.connect('ws://' + host + '/websocket', {headers: {"User-Agent": "Nabaztag/" + version}});

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
    console.log('connected to ' + host);
    nab.sendToHMD('connexion', 'hard_id', homedoudouId);
    nab.sendToHMD('archive', 'infos', 'se connecte');
    nab.sendToHMD('archive', 'vivant', '1');
    setInterval(function() {
      nab.sendToHMD('archive', 'vivant', '1');
    }, 1000 * 60 * 10);
  }

  if(data['msg'] === 'command') {
    const command = data['command'];
    nab.sendToRabbit(command);
  }

  if(data['msg'] === 'error') {
    console.log('----------- ERROR --------', data['reason']);
  }

});

const NODE_SERVER_PORT = 8076;

// node server
const http = require('http');
const url = require('url');

http.createServer(function(req, res) {
  const currentUrl = url.parse(req.url, true);
  const pathName = currentUrl.pathname;
  console.log('URL : ', currentUrl.path);
  if(pathName === "/") {
    const data = {title: 'nabaztag'};
    data.body = process.argv[2];

    fs.readFile('index.html', 'utf-8', function(error, source) {
      const template = handlebars.compile(source);
      const html = template(data);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(html);
      res.end();
    });
  }
  else if(pathName === "/favicon.ico") {
  }
  else if(pathName === "/nadb") {
    let data = currentUrl.query;
    nab.sendToRabbit(data.data);

    fs.readFile('nadb.html', 'utf-8', function(error, source) {
      const template = handlebars.compile(source);
      const html = template(data);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(html);
      res.end();
    });
  }
  else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('404');
    res.end();
  }
}).listen(NODE_SERVER_PORT);

console.log('server listen on port : ' + NODE_SERVER_PORT);

const nabaztagSendChoreography = function(base64, callback) {
  $.ajax({
    type: "PUT",
    url: '/api/command',
    data: {"sequence": "[{\"choreography\":\"data:application/x-nabaztag-mtl-choreography;base64," + base64 + "\"}]"},
    success: function(data, status, xhr) {
      if(callback) {
        callback();
      }
    },
    error: function(jqXhr, textStatus, errorMessage) {
      console.log("AJAX error");
      if(callback) {
        callback();
      }
    },
  });
};



