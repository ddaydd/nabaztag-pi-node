/*
Created by David FAIVRE-MAÇON
https://www.davidfm.me

Serveur NODEJS pour nabaztag pi

Connexion homedoudou
https://www.homedoudou.fr

*/

const version = "0.4.2";

const helpers = require('./helpers.js');
const ddp = require('./ddp.js');
const choreography = require('./choreography.js');

// Connexion homedoudou.fr en websocket
// const host = '127.0.0.1:3000';
const host = 'hard.homedoudou.fr';
ddp.connect('ws://' + host + '/websocket', {headers: {"User-Agent": "Nabaztag/" + version}});

// Serveur NODEJS

const express = require('express');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const bodyParser = require("body-parser");
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
  }
}));
app.set('view engine', '.hbs');

const port = 8076;
const server = app.listen(port, () => console.log(`server listen on port : ${port}`));
const io = require('socket.io').listen(server);

let chor = [];
// helpers.gestalt = {};

app.get('/', (req, res) => {
  helpers.sendToRabbit('{"type": "gestalt"}', function(gestalt) {
    if(gestalt) {
      // helpers.gestalt = gestalt;
      setTimeout(function() {
        io.emit('gestalt', gestalt.toString('ascii'));
      }, 2000);
    }
  });
  const data = {
    name: "home",
    // gestalt: helpers.gestalt,
  };
  res.render('index', data);
});

app.get('/nadb', (req, res) => {
  const data = {
    name: "nadb",
    opCode: choreography.opCode,
  };
  res.render('nadb', data);
});

app.post('/nadb', (req, res) => {
  const form = req.body;

  if(form.data) helpers.sendToRabbit(form.data);
  if(form.chor) helpers.sendChoreographyToRabbit(form.chor);

  res.redirect('/nadb');
});

app.get('/chorgenerator', (req, res) => {
  const data = {
    name: "chorgenerator",
    chor: chor,
  };
  res.render('chorgenerator', data);
});

app.post('/chorgenerator', (req, res) => {
  const form = req.body;
  console.log('form.chorValue', form.chorValue);
  if(form.reset === 'reset') chor = [];
  else chor = chor.concat(form.chorValue);
  console.log(chor);
  res.redirect('/chorgenerator');
});

app.use(function(req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

io.sockets.on('connect', function(socket) {
  console.log('connect');
});

Handlebars.registerHelper("stringify", function(s) {
  return JSON.stringify(s);
});

Handlebars.registerHelper("isActive", function(url, name) {
  return url === name ? "active" : "";
});

