const fs = require('fs');
const path = require('path');

const leftPad = require('left-pad');

const SOURCE_DIR = path.join(__dirname, 'source-images');
const DEST_DIR   = path.join(__dirname, 'dest-images');

var sourceItems = fs.readdirSync(SOURCE_DIR);

// sourceItems = sourceItems.slice(0, 10)

sourceItems.forEach((item, index) => {

  var readStream = fs.createReadStream(path.join(SOURCE_DIR, item));

  readStream.pipe(fs.createWriteStream(
    path.join(DEST_DIR, leftPad(index, 5, '0') + '.png')
  ));

});
