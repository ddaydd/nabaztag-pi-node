/*
Created by David FAIVRE-MAÇON
https://www.davidfm.me

Serveur NODEJS pour nabaztag pi

Connexion homedoudou
https://www.homedoudou.fr

*/

const version = "0.5";

const helpers = require('./helpers.js');
const ddp = require('./ddp.js');
const choreography = require('./choreography.js');
const os = require('os');

// Connexion homedoudou.fr en websocket
// const host = '127.0.0.1:3000';
const host = 'hard.homedoudou.fr';
ddp.connect('ws://' + host + '/websocket', {headers: {"User-Agent": "Nabaztag/" + version}});

// Serveur NODEJS

const express = require('express');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const bodyParser = require("body-parser");
const fs = require('fs');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.engine('.hbs', exphbs({
  layoutsDir: './views/layouts',
  defaultLayout: 'layout',
  partialsDir: './views/layouts/partials/',
  extname: '.hbs',
  helpers: {
    version: function() {
      return version;
    },
  },
}));
app.set('view engine', '.hbs');

const port = 8076;
const server = app.listen(port, () => console.log(`server listen on port : ${port}`));
const io = require('socket.io').listen(server);

let chor = [];
// helpers.gestalt = {};

app.get('/', (req, res) => {
  const data = {
    name: "home",
    os: {
      platform: os.platform(),
      arch: os.arch(),
      type: os.type(),
      release: os.release(),
      cpus: os.cpus(),
      freemem: helpers.bytesToSize(os.freemem()),
      totalmem: helpers.bytesToSize(os.totalmem()),
    },
  };
  res.render('home', data);
});

app.get('/nabd', (req, res) => {
  const data = {
    name: "nabd",
    opCode: choreography.opCode,
  };
  res.render('nabd', data);
});

app.post('/nabd', (req, res) => {
  const form = req.body;

  if(form.data) helpers.sendToRabbit(form.data);
  if(form.chor) helpers.sendChoreographyToRabbit(form.chor);

  res.redirect(req.headers.referer);
});

app.get('/chorgenerator', (req, res) => {
  const data = {
    name: "chorgenerator",
    chor: chor,
    options: function() {
      const options = [];
      for(let i = 0; i <= 255; i++) {
        if(i === 16)
          options.push({value: i, text: i, isSelected: true});
        else
          options.push({value: i, text: i});
      }
      return options;
    },

  };
  res.render('chorgenerator', data);
});

app.post('/chorgenerator', (req, res) => {
  const form = req.body;
  console.log('form.chorValue', form.chorValue);
  if(form.reset === 'reset') chor = [];
  else if(form.save === 'save') {
    const base64ch = Buffer.from(String.fromCharCode.apply(null, chor)).toString('base64');
    console.log('base64ch', base64ch);
    helpers.sendToRabbit(JSON.stringify({"type": "command", "sequence": [{"choreography": "data:application/x-nabaztag-mtl-choreography;base64," + base64ch}]}));
    fs.writeFile('./public/chorFiles/generated_' + helpers.getFormattedTime() + '.chor', base64ch, function(err) {
      if(err) return console.log(err);
    });
  }
  else chor = chor.concat(form.chorValue);
  console.log(chor);
  res.redirect('/chorgenerator');
});

app.get('/chorFiles', (req, res) => {

  const fs = require('fs');

  const filenames = fs.readdirSync('./public/chorFiles/');

  const data = {
    name: "chorFiles",
    chor: chor,
    filenames: filenames,
  };
  res.render('chorFiles', data);
});

app.use(function(req, res, next) {
  res.status(404).render('404');
});

io.sockets.on('connect', function(socket) {
  console.log("client connect");

  socket.on('getGestalt', function() {
    helpers.sendToRabbit('{"type": "gestalt"}', function(gestalt) {
      if(gestalt) {
        socket.emit('gestalt', gestalt.toString('ascii'));
      }
      else
        socket.emit('gestalt', '{}');
    });
  });
});

Handlebars.registerHelper("stringify", function(s) {
  return JSON.stringify(s, null, 4);
});

Handlebars.registerHelper("isActive", function(url, name) {
  return url === name ? "active" : "";
});

