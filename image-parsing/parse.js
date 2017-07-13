const fs   = require('fs');
const path = require('path');

const opencv = require('opencv');
const mkdirp = require('mkdirp');

// constants
const SOURCE_DIR_PATH = path.join(__dirname, '../source-images');
const THRESHOLDED_DIR_PATH = path.join(__dirname, 'thresholded');

const MIN_RED = 120;
const MAX_RED = 255;

const MIN_AREA = 100;

const IMAGE_CENTER = {
  x: 634,
  y: 361
};

const BLUE  = [255, 0, 0]; // B, G, R
const RED   = [0, 0, 255]; // B, G, R
const GREEN = [0, 255, 0]; // B, G, R
const WHITE = [255, 255, 255]; // B, G, R

mkdirp.sync(THRESHOLDED_DIR_PATH);

// (B)lue, (G)reen, (R)ed
const lower_threshold = [0, 0, MIN_RED];
const upper_threshold = [100, 100, MAX_RED];

// auxiliary functions
function calcAngle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}


var sourceImages = fs.readdirSync(SOURCE_DIR_PATH).filter((filename) => {
  return /\.png$/.test(filename);
});

// TEST:
// sourceImages = sourceImages.slice(0, 10);


// parse image by image
var allImagesParsed = sourceImages.reduce((lastPromise, imageName) => {

  return lastPromise.then((allResults) => {

    return new Promise((resolve, reject) => {
      var imagePath = path.join(SOURCE_DIR_PATH, imageName);
      var thresholdedPath = path.join(THRESHOLDED_DIR_PATH, imageName);

      var started = Date.now();

      opencv.readImage(imagePath, function(err, im) {
        if (err) {
          reject(err);
          return;
        }
        if (im.width() < 1 || im.height() < 1) {
          reject(new Error('Image has no size'));
          return;
        }

        // create an image for thresholding
        var imThresholded = im.copy();
        imThresholded.inRange(lower_threshold, upper_threshold);

        // create an image only for the contours
        var imContours = imThresholded.copy();
        var contours = imContours.findContours();

        var currentResults = {
          filename: imageName,
          spheres: [],
        };

        // console.log(contours.size());
        
        var contourBoundingRect;
        var contourSphere;

        // Access vertex data of contours
        for (var c = 0; c < contours.size(); ++c) {
          // console.log('Contour', c);
          // console.log('isConvex', contours.isConvex(c));
          // console.log('area', contours.area(c));

          if (contours.area(c) > MIN_AREA) {

            contourBoundingRect = contours.boundingRect(c);
            contourSphere       = {};

            contourSphere.boundingRect = contourBoundingRect;
            contourSphere.center = {
              x: contourBoundingRect.x + (contourBoundingRect.width / 2),
              y: contourBoundingRect.y + (contourBoundingRect.height / 2),
            };
            contourSphere.area = contours.area(c);
            contourSphere.angle = calcAngle(
              IMAGE_CENTER.x,
              IMAGE_CENTER.y,
              contourSphere.center.x,
              contourSphere.center.y
            );

            currentResults.spheres.push(contourSphere)

            // highlights
            im.rectangle(
              [contourBoundingRect.x - 1, contourBoundingRect.y - 1],
              [contourBoundingRect.width + 1, contourBoundingRect.height + 1],
              [255, 255, 255]
            );
          } else {
            contourBoundingRect = undefined;
            contourSphere = undefined;
          }
        }

        // use the sphere whose angle
        // is within 120deg
        currentResults.referenceSphere = currentResults.spheres.find((sphere) => {
          return sphere.angle > 0 && sphere.angle <= 121;
        });
        
        // draw angle
        if (currentResults.referenceSphere) {
          im.line(
            [IMAGE_CENTER.x, IMAGE_CENTER.y],
            [currentResults.referenceSphere.center.x, currentResults.referenceSphere.center.y],
            [255, 255, 255]
          );
        } else {
          console.log('MISSING referenceSphere ' + imageName);
        }

        // start and end angle
        // im.line(
        //   [IMAGE_CENTER.x, IMAGE_CENTER.y],
        //   [IMAGE_CENTER.x + 400, IMAGE_CENTER.y],
        //   [120, 120, 120]
        // );
        // im.line(
        //   [IMAGE_CENTER.x, IMAGE_CENTER.y],
        //   [IMAGE_CENTER.x, IMAGE_CENTER.y + 400],
        //   [120, 120, 120]
        // );


        // add to the results
        allResults.push(currentResults);
        
        var ended = Date.now();

        // convertGrayscale (to save disk space) and save the image
        // (only when the sphere count is as expected)
        if (currentResults.spheres.length === 3) {
          im.convertGrayscale();
          console.log(`[ok] ${imageName} after ${ended - started}ms`)
        } else {
          console.log(`[missing: ${3 - currentResults.spheres.length}] ${imageName} after ${ended - started}ms`)
        }
        im.save(thresholdedPath);
        // console.log(`Image saved to ${thresholdedPath}`);
        
        var ended = Date.now();


        resolve(allResults);
      });
    })

  })

}, Promise.resolve([]));

allImagesParsed.then((results) => {
  fs.writeFileSync(
    path.join(__dirname, 'results.json'),
    JSON.stringify(results, null, '  '),
    'utf8'
  );
});
