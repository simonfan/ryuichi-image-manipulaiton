// native
const fs   = require('fs');
const path = require('path');
const child_process = require('child_process');

// third-party
const mkdirp  = require('mkdirp');
const leftPad = require('left-pad');
const ffmpeg  = require('fluent-ffmpeg');
const rimraf  = require('rimraf');

// internal
const shuffle = require('../lib/shuffle');

// constants
const SOURCE_IMAGES_DIR = path.join(__dirname, '../SAKAMOTO');
const DEST_IMAGES_DIR   = path.join(__dirname, 'test-7-mongean');

const FFMPEG_COMMAND = `ffmpeg -framerate 24 -pattern_type glob -i '*.png' -c:v libx264 -pix_fmt yuv420p out.mp4`;

rimraf.sync(DEST_IMAGES_DIR);
mkdirp.sync(DEST_IMAGES_DIR + '/images');

var sourceImages = fs.readdirSync(SOURCE_IMAGES_DIR);
var images = sourceImages
              .concat(sourceImages)
              .concat(sourceImages)
              .concat(sourceImages); // 4 rotations


var SHUFFLE_STRATEGY = [
  'mongean',
];

var shuffledImages = shuffle(images, SHUFFLE_STRATEGY);

console.log('total frames', shuffledImages.length);

// register data about the shuffle experiment
fs.writeFileSync(
  path.join(DEST_IMAGES_DIR, 'data.json'),
  JSON.stringify({
    images: shuffledImages,
    strategy: SHUFFLE_STRATEGY,
    totalFrames: shuffledImages.length,
  }, null, '  '),
  'utf8'
);

var copyImagesPromise = Promise.all(shuffledImages.map((image, index) => {
  return new Promise((resolve, reject) => {

    var read = fs.createReadStream(path.join(SOURCE_IMAGES_DIR, image));
    var write = fs.createWriteStream(path.join(
      DEST_IMAGES_DIR,
      'images',
      leftPad(index, 5, '0') + '-' + image)
    );

    read.pipe(write);

    write
      .on('finish', function () {
        resolve();
      })
      .on('error', reject);
  });
}));

copyImagesPromise.then(() => {
  console.log('copied');
  // child_process.exec(`ffmpeg -framerate 24 -pattern_type glob -i '*.png' -c:v libx264 -pix_fmt yuv420p out.mp4`)
})
.catch((err) => {
  console.warn('error', err);
});
