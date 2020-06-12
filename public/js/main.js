const socket = io.connect(location.hostname + ':8076');
const helpers = {};

helpers.toHHMMSS = function(s) {
  const sec_num = parseInt(s, 10); // don't forget the second param
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  let seconds = sec_num - (hours * 3600) - (minutes * 60);

  if(hours < 10) {
    hours = "0" + hours;
  }
  if(minutes < 10) {
    minutes = "0" + minutes;
  }
  if(seconds < 10) {
    seconds = "0" + seconds;
  }
  return `${hours}h ${minutes}min  ${seconds}sec`;
};