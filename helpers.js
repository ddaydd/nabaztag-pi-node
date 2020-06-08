const NetcatClient = require('netcat/client');

const helpers = {};

helpers.sendToRabbit = function(data, callback) {
  console.log(data, typeof data);
  if(!data || typeof data !== 'string') return console.log('Error data, must be string');

  // change les nombres "string" en "int"
  data = JSON.stringify(JSON.parse(data, function(k, v) {
    return (typeof v === "object" || isNaN(v)) ? v : parseInt(v, 10);
  }));

  console.log('netcat send : ', data);
  const nc = new NetcatClient();
  const client = nc.addr('127.0.0.1').port(10543).connect().send(data, function(err, res) {
    if(err) {
      data = err;
      console.log('netcat ERROR ', err);
    }
    else {
      console.log("netcat data sent", res);
      if(callback) callback();
    }
  }).close(function() {
    console.log('netcat closed');
  });

  client.on('data', function (d) {
    if(callback) callback(d);
  })

};

helpers.sendChoreographyToRabbit = function(chor) {
  console.log('chor', chor);

  const base64ch = Buffer.from(String.fromCharCode.apply(null, JSON.parse(chor))).toString('base64');
  console.log('base64ch', base64ch);
  helpers.sendToRabbit(JSON.stringify({"type": "command", "sequence": [{"choreography": "data:application/x-nabaztag-mtl-choreography;base64," + base64ch}]}));

  // helpers.ledWrapper('2', '#f00');

  // helpers.sendToRabbit({"sequence": [{"choreography": "data:application/x-nabaztag-mtl-choreography;base64," + base64ch}]});

  // Ears step de -17 à 17
  // [0,20,ear,dir,0,17,ear,stepsPos]
  // wait=0, commande=20 (setmotordir), motor=ear, dir=dir
  // wait=0, commande=17 (avance), motor=ear, delta=stepsPos

  // Led
  // 0 | 1 | 2 | 3 | 4; // nose, left, middle, right and bottom led
  // [0,1,10,0,7,led,rgba[0],rgba[1],rgba[2],0,0,15,7,led,0,0,0,0,0]
  // wait=0, commande=1 (frame_duration), timescale=10
  // wait=0, commande=7 (set_led_color), led=led, r=rgba[0], g=rgba[1], b=rgba[2], ignored=0, ignored=0
  // wait=15, commande=7 (set_led_color), led=led, r=0, g=0, b=0, ignored=0, ignored=0
};

helpers.IsJsonString = function(str) {
  try {
    JSON.parse(str);
  }
  catch(e) {
    return false;
  }
  return true;
};

helpers.hexToRgbA = function(hex) {
  // hexToRgbA('#fbafff')

  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    let c = hex.substring(1).split('');
    if(c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return '[' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ', 255]';
  }
  throw new Error('Bad Hex');
};

helpers.colorToRGBA = function(color) {
  // Returns the color as an array of [r, g, b, a] -- all range from 0 - 255
  // color must be a valid canvas fillStyle. This will cover most anything
  // you'd want to use.
  // Examples:
  // colorToRGBA('red')  # [255, 0, 0, 255]
  // colorToRGBA('#f00') # [255, 0, 0, 255]
  var cvs, ctx;
  cvs = document.createElement('canvas');
  cvs.height = 1;
  cvs.width = 1;
  ctx = cvs.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return ctx.getImageData(0, 0, 1, 1).data;
};

helpers.ledWrapper = function(led, color, callback) {
  // interpreter._nabaztagActions.push({action: "led", parameters: [led.data, color.data]});
  const rgba = helpers.hexToRgbA(color);

  const base64ch = Buffer.from(String.fromCharCode.apply(null, [0, 7, led, rgba[0], rgba[1], rgba[2], 0, 0])).toString('base64');
  console.log('base64ch', base64ch);
  helpers.sendToRabbit(JSON.stringify({"sequence": [{"choreography": "data:application/x-nabaztag-mtl-choreography;base64," + base64ch}]}), callback);
};

module.exports = helpers;
