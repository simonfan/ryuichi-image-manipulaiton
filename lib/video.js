// native
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// third-party
const rimraf   = require('rimraf');
const mkdirp   = require('mkdirp');
const Bluebird = require('bluebird');
const leftPad  = require('left-pad');
const tmp      = require('tmp');

// constants
const SAKAMOTO_THUMBNAILS_DIR = path.join(__dirname, '../SAKAMOTO_thumbnails');

exports.baseFrames = function (sourceDir) {
  sourceDir = sourceDir || SAKAMOTO_THUMBNAILS_DIR;

  return fs.readdirSync(sourceDir);
};

exports.copyFrames = function (options) {
  var sourceDir = options.sourceDir || SAKAMOTO_THUMBNAILS_DIR;
  var destDir   = options.destDir;
  var frames    = options.frames;

  if (!sourceDir) {
    throw new Error('sourceDir required');
  }
  if (!destDir) {
    throw new Error('destDir required');
  }
  if (!frames) {
    throw new Error('frames required');
  }

  mkdirp.sync(destDir);

  return frames.reduce((lastPromise, frame, frameIndex) => {

    return lastPromise.then(() => {
      return new Bluebird((resolve, reject) => {
        var read = fs.createReadStream(path.join(sourceDir, frame));
        var write = fs.createWriteStream(path.join(destDir, leftPad(frameIndex + 1, 5, '0') + '-' + frame));

        read.pipe(write);

        write.on('finish', resolve);
        write.on('error', reject);
      });
    });

  }, Bluebird.resolve());
};

exports.ffmpegCommand = function (options) {

  var framerate = options.framerate || 24;
  var glob      = options.glob;
  var output    = options.output || 'video.mp4';

  if (!glob) {
    throw new Error('glob required');
  }

  var metadata  = options.metadata || {};

  metadata.framerate = framerate;

  var stringifiedMetadata = '';

  if (metadata) {
    Object.keys(metadata).forEach((key) => {
      var value = metadata[key];

      stringifiedMetadata += `${key} - ${value}\n`;
    });
  }

  return `ffmpeg \
                -y \
                -framerate \
                ${framerate} \
                -pattern_type glob \
                -i '${glob}' \
                -c:v libx264 \
                -pix_fmt yuv420p \
                -vf drawtext='text=${stringifiedMetadata}:y=20:x=20:fontfile=Monaco:fontsize=10' \
                ${output}`
}

exports.generateVideo = function (options) {
  var sourceDir = options.sourceDir || SAKAMOTO_THUMBNAILS_DIR;
  var dest      = options.dest;
  var frames    = options.frames;

  if (!sourceDir) {
    throw new Error('sourceDir required');
  }
  if (!dest) {
    throw new Error('dest required');
  }
  if (!frames) {
    throw new Error('frames required');
  }

  // ensure the dir exists
  mkdirp.sync(path.dirname(dest));

  var _tmpDir;

  // create temporary dir
  return new Bluebird((resolve, reject) => {
    var tmpDirOpts = {
      unsafeCleanup: true,
    };

    tmp.dir(tmpDirOpts, (err, dirPath, cleanupCallback) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        path: dirPath,
        cleanup: cleanupCallback,
      });
    });
  })
  .then((tmpDir) => {
    _tmpDir = tmpDir;

    mkdirp.sync(_tmpDir.path + '/frames');

    return exports.copyFrames({
      sourceDir: sourceDir,
      destDir: _tmpDir.path + '/frames',
      frames: frames,
    });
  })
  .then(() => {
    return new Bluebird((resolve, reject) => {
      var ffmpegCommand = exports.ffmpegCommand({
        glob: 'frames/*.png',
        output: 'video.mp4',

        // may be passed from outside
        framerate: options.framerate,
        metadata: Object.assign({}, options.metadata, {
          totalFrames: frames.length,
        }),
      });

      var proc = child_process.exec(ffmpegCommand, {
        cwd: _tmpDir.path,
      });

      proc.on('error', reject);
      proc.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('ffmpeg exited with code ' + code));
        }
      });

      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stderr);
    });
  })
  .then(() => {
    return new Bluebird((resolve, reject) => {

      // copy video to final location
      var read = fs.createReadStream(_tmpDir.path + '/video.mp4');
      var write = fs.createWriteStream(dest);

      read.pipe(write);

      write.on('error', reject);
      write.on('finish', resolve);
    });
  })
  .then(() => {
    _tmpDir.cleanup();
    console.log('video ok and cleanup done')
  })
  .catch((err) => {
    _tmpDir.cleanup();

    throw err;
  });
};
