const video = require('../lib/video');


var baseFrames = video.baseFrames();

// video.copyFrames({
//   frames: baseFrames.concat(baseFrames).concat(baseFrames).concat(baseFrames).concat(baseFrames).concat(baseFrames),
//   destDir: __dirname + '/test'
// })
// .then(() => {
//   console.log('copied');
// });

video.generateVideo({
  frames: baseFrames.concat(baseFrames).concat(baseFrames).concat(baseFrames).concat(baseFrames).concat(baseFrames),
  dest: __dirname + '/test.mp4',
  metadata: {
    fps: 20,
    lala: 'test',
  }
})
.then(() => {
  console.log('video generated');
});
