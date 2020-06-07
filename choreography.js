// https://github.com/OpenJabNab/OpenJabNab/blob/master/bootcode/sources/main.mtl
// https://nabaztag.forumactif.fr/t15021-generateur-choregraphie-en-php
// https://github.com/datagutt/pynab.js/blob/master/src/services/Command.ts

const choreography = {
  ledRange: ['nose', 'left', 'middle', 'right', 'bottom'],
  opCode: [
    {name: 'nop', value: 0},
    {name: 'frame_duration', value: 1},
    {name: 'set_color', value: 6},
    {name: 'set_led_color', value: 7},
    {name: 'set_motor', value: 8},
    {name: 'set_leds_color', value: 9},// # v16
    {name: 'set_led_off', value: 10},// # v17
    {name: 'set_led_palette', value: 14},
    {name: 'set_palette', value: 15},
    {name: 'randmidi', value: 16},
    {name: 'avance', value: 17},
    {name: 'ifne', value: 18},
    {name: 'attend', value: 19},
    {name: 'setmotordir', value: 20},
    {name: 'file_midi', value: 30},

  ],
  moveEar: function(ear, steps) {
    if(ear < -17 || ear > 17) return [];
    if(!steps) return [];
    let stepsPos = steps;
    let dir = 0;
    if(steps < 0) {
      dir = 1;
      stepsPos = -steps;
    }

    return [
      0, choreography.opcode.setmotordir, ear, dir,
      0, choreography.opcode.avance, ear, stepsPos,
    ];

  },
};

module.exports = choreography;


