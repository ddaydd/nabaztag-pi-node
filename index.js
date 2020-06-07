/*
Created by David FAIVRE-MAÇON
https://www.davidfm.me

Serveur NODEJS pour nabaztag pi

Connexion homedoudou
https://www.homedoudou.fr

*/

const version = 0.4;

const fs = require('fs');
const nab = require('./helpers.js');
const ddp = require('./ddp.js');
const choreography = require('./choreography.js');

// Connexion homedoudou.fr en websocket
// const host = '127.0.0.1:3000';
const host = 'hard.homedoudou.fr';
ddp.connect('ws://' + host + '/websocket', {headers: {"User-Agent": "Nabaztag/" + version}});

// Serveur NODEJS

const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.engine('.hbs', handlebars({
  layoutsDir: './views/layouts',
  defaultLayout: 'layout',
  partialsDir: './views/layouts/partials/',
  extname: '.hbs',
}));
app.set('view engine', '.hbs');

const port = 8076;
let chor = "";

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/nadb', (req, res) => {
  res.render('nadb', {opCode: choreography.opCode});
});

app.post('/nadb', (req, res) => {
  const form = req.body;

  if(form.data) nab.sendToRabbit(form.data);
  if(form.chor) nab.sendChoreographyToRabbit(form.chor);

  res.redirect('/nadb');
});

app.get('/chorgenerator', (req, res) => {
  res.render('chorgenerator', {chor: chor});
});

app.post('/chorgenerator', (req, res) => {
  const form = req.body;
  // console.log(form);
  if(form.reset === 'reset') chor = "";
  else chor = chor + "[" + form.chorValue + "]<br>";
  res.redirect('/chorgenerator');
});

app.use(function(req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

app.listen(port, () => console.log(`server listen on port : ${port}`));



