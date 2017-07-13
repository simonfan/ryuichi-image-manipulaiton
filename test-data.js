const fs = require('fs');
const path = require('path');

const leftPad = require('left-pad');

const DEST_PATH = path.join(__dirname, 'test-data');

var dataLength = 1000;

while (dataLength > 0) {

  fs.writeFileSync(path.join(DEST_PATH, leftPad(dataLength, 5, '0')), dataLength, 'utf8');

  // console.log(dataLength);

  dataLength -= 1;
}

