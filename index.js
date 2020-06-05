/*
Created by David FAIVRE-MAÇON
https://www.davidfm.me

Serveur NODEJS pour nabaztag pi

Connexion homedoudou
https://www.homedoudou.fr

*/

const fs = require('fs');
const handlebars = require('handlebars');
const ddp = require('./ddp.js');
const http = require('http');
const url = require('url');

const version = 0.3;

// Connexion homedoudou.fr en websocket
// const host = '127.0.0.1:3000';
const host = 'hard.homedoudou.fr';
ddp.connect('ws://' + host + '/websocket', {headers: {"User-Agent": "Nabaztag/" + version}});

// Serveur NODEJS
const NODE_SERVER_PORT = 8076;

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



