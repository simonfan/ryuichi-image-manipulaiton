// native
const fs   = require('fs');
const path = require('path');

const SOURCE_IMAGES_DIR = path.join(__dirname, '../SAKAMOTO');

function randomInteger(conditions) {
  var max = conditions.max;
  var notWithin = conditions.notWithin;

  var candidate = Math.round(Math.random() * max);

  if (notWithin) {
    while (candidate >= notWithin[0] && candidate <= notWithin[1]) {
      candidate = Math.round(Math.random() * max);
    }
  }

  return candidate;
}

function randomItem(arr) {
  var index = randomInteger(arr.length);

  return arr[index];
}

function createArray(length) {
  var arr = [];

  while (arr.length < length) {
    arr.push(null);
  }

  return arr;
}

function switchGroups(arr, groupSize) {
  
}


function shuffleArray(arr, options) {
  arr = arr.slice(0);

  options = options || {};

  var rounds    = options.rounds || 1;
  var groupSize = options.groupSize || 1;

  if (groupSize > arr.length) {
    throw new Error(`groupSize '${groupSize}' too large for array length '${arr.length}'`);
  }

  var newArr = createArray(arr.length);

  var indexA;
  var indexB;
  var shuffledGroup;
  var lastNullPosition = 0;
  // var arrB;

  while (rounds) {
    indexA = randomInteger({
      max: arr.length - groupSize,
    });

    indexB = randomInteger({
      max: arr.length - groupSize,
      // notWithin: [indexA, indexA + groupSize],
    });

    // remove the shuffledGroup from the source array
    shuffledGroup = arr.splice(indexA, indexA + groupSize);
    
    // move items from the shuffledGroup to the new array
    shuffledGroup.forEach((item, index) => {
      newArr[indexB + index] = item;
    });

    // move remaining items in order to null positions in the new array
    arr.forEach((item, index) => {

    });

    // replace stuff in array using splice
    arr.splice.apply(arr, [indexA, arrB.length].concat(arrB));
    console.log('indexA', indexA)
    console.log('indexB', indexB)
    console.log('AFTER SPLICE: ', arr.length)

    arr.splice.apply(arr, [indexB, arrA.length].concat(arrA));

    rounds--;
  }

  return arr;
}






var images = fs.readdirSync(SOURCE_IMAGES_DIR);


var shuffledImages = shuffleArray(images, {
  rounds: 1,
  groupSize: 90,
});

shuffledImages = shuffledImages.map((img, index) => {
  if (img !== images[index]) {
    return path.parse(img).name + '-shuffled' + path.parse(img).ext;
  } else {
    return img;
  }
})

console.log(shuffledImages.length);

// console.log(images);

fs.writeFileSync(
  path.join(__dirname, 'shuffled-images.json'),
  JSON.stringify(shuffledImages, null, '  '),
  'utf8'
);

