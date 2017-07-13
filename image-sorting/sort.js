const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');
const leftPad = require('left-pad');

// constants
const SORTED_DIR_PATH = path.join(__dirname, 'sorted');
const SOURCE_DIR_PATH = path.join(__dirname, '../source-images');

const PARSING_RESULTS = require('./results-v1.json');

mkdirp.sync(SORTED_DIR_PATH);


var images = PARSING_RESULTS.map(r => {
  return {
    filename: r.filename,
    angle: r.referenceSphere.angle,
  };
});

images.sort((a, b) => {
  if (a.angle < b.angle) {
    return -1;
  } else {
    return 1;
  }
});

// build a sequence of images
var sequence = [];
var sequenceStep = 0.5;

var currentAngle = 0;
var currentAngleBestCandidate;

while (currentAngle <= 120) {

  currentAngleBestCandidate = images.reduce((current, candidate) => {
    if (current === null) {
      return candidate;
    } else {
      if (Math.abs(candidate.angle - currentAngle) < Math.abs(current.angle - currentAngle)) {
        return candidate;
      } else {
        return current;
      }
    }
  }, null);

  if (Math.abs(currentAngleBestCandidate.angle - currentAngle) <= sequenceStep) {
    sequence.push({
      angle: currentAngle,
      filename: currentAngleBestCandidate.filename,
      distortion: currentAngle - currentAngleBestCandidate.angle,
    });
  } else {
    sequence.push({
      angle: currentAngle,
      filename: null,
    });
  }

  currentAngle += sequenceStep;
}

fs.writeFileSync(
  path.join(__dirname, 'sorted-images.json'),
  JSON.stringify(sequence, null, '  '),
  'utf8'
);




sequence.forEach((image, position) => {

  if (image.filename) {
    fs.createReadStream(path.join(SOURCE_DIR_PATH, image.filename))
      .pipe(fs.createWriteStream(
        path.join(SORTED_DIR_PATH, leftPad(image.angle * 2, 5, '0') + '-' + image.filename)
      ));
  }
});

// console.log(angles);
