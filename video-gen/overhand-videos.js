const BezierEasing = require('bezier-easing');

const shuffle = require('../lib/shuffle');
const video   = require('../lib/video');

const CURVES = {
  linear: BezierEasing(0, 0, 0, 0),
  easeInSine: BezierEasing(0.47, 0, 0.745, 0.715),
  easeOutSine: BezierEasing(0.39, 0.575, 0.565, 1),
  easeInOutSine: BezierEasing(0.445, 0.05, 0.55, 0.95),
};

const ROTATIONS = 30;

function overhandShuffleDiscreteSequence(curve) {
  var rotations = [];

  var rotationFrames;
  var shuffleRounds;

  while (rotations.length < ROTATIONS) {
    // DISCRETE: Shuffling always starts from base frames
    rotationFrames = video.baseFrames();
    shuffleRounds  = Math.round(
      curve(rotations.length / ROTATIONS) * ROTATIONS
    );

    rotations.push(
      shuffle(video.baseFrames(), {
        type: 'overhand',
        cuts: 4,
        rounds: shuffleRounds,
      })
    );
  }

  return rotations.reduce((res, rotation) => {
    return res.concat(rotation);
  }, []);
}

function overhandShuffleContinuousSequence(curve) {
  var rotations = [];

  var rotationFrames = video.baseFrames();
  var shuffledRounds = 0
  var shuffleDelta   = 0;

  while (rotations.length < ROTATIONS) {
    // CONTINUOUS: shuffling starts from previous shuffled position
    // rotationFrames = video.baseFrames();
    shuffleDelta  = Math.round(
      curve(rotations.length / ROTATIONS) * ROTATIONS
    ) - shuffledRounds;

    shuffledRounds += shuffleDelta;

    // console.log(shuffleDelta);
    // console.log(shuffledRounds);

    rotationFrames = shuffle(rotationFrames, {
      type: 'overhand',
      cuts: 4,
      rounds: shuffleDelta,
    });

    // copy and push
    rotations.push(rotationFrames.slice(0));
  }

  return rotations.reduce((res, rotation) => {
    return res.concat(rotation);
  }, []);
}

// overhandShuffleContinuousSequence(CURVES.easeInSine)

video.generateVideo({
  frames: overhandShuffleContinuousSequence(CURVES.easeInSine),
  dest: __dirname + '/test.mp4',

  framerate: 72,
  metadata: {
    curve: 'easeInSine',
    rotations: ROTATIONS,
    shuffle: 'overhand',
  }
})
.then(() => {
  console.log('video generated');
});

