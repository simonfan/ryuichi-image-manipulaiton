// native
const fs   = require('fs');
const path = require('path');

const SOURCE_IMAGES_DIR = path.join(__dirname, '../SAKAMOTO');

const shuffle = require('../lib/shuffle');

// function randomInteger(conditions) {
//   var max = conditions.max;
//   var notWithin = conditions.notWithin;

//   var candidate = Math.round(Math.random() * max);

//   if (notWithin) {
//     while (candidate >= notWithin[0] && candidate <= notWithin[1]) {
//       candidate = Math.round(Math.random() * max);
//     }
//   }

//   return candidate;
// }

// function randomItem(arr) {
//   var index = randomInteger(arr.length);

//   return arr[index];
// }

function createArray(length, item) {
  var arr = [];

  item = item || null;

  while (arr.length < length) {
    arr.push(item);
  }

  return arr;
}

// function switchGroups(arr, groupSize) {
//   arr = arr.slice(0);

//   groupSize = groupSize || 1;

//   if (groupSize > arr.length / 2) {
//     // for the switch groups alg to work, the array must have at 
//     throw new Error(`groupSize '${groupSize}' too large for array length '${arr.length}'`);
//   }
// }


// function shuffleArray(arr, options) {
//   arr = arr.slice(0);

//   options = options || {};

//   var rounds    = options.rounds || 1;
//   var groupSize = options.groupSize || 1;

//   if (groupSize > arr.length) {
//     throw new Error(`groupSize '${groupSize}' too large for array length '${arr.length}'`);
//   }

//   var newArr = createArray(arr.length);

//   var indexA;
//   var indexB;
//   var shuffledGroup;
//   var lastNullPosition = 0;
//   // var arrB;

//   while (rounds) {
//     indexA = randomInteger({
//       max: arr.length - groupSize,
//     });

//     indexB = randomInteger({
//       max: arr.length - groupSize,
//       // notWithin: [indexA, indexA + groupSize],
//     });

//     // remove the shuffledGroup from the source array
//     shuffledGroup = arr.splice(indexA, indexA + groupSize);
    
//     // move items from the shuffledGroup to the new array
//     shuffledGroup.forEach((item, index) => {
//       newArr[indexB + index] = item;
//     });

//     // move remaining items in order to null positions in the new array
//     arr.forEach((item, index) => {

//     });

//     // replace stuff in array using splice
//     arr.splice.apply(arr, [indexA, arrB.length].concat(arrB));
//     console.log('indexA', indexA)
//     console.log('indexB', indexB)
//     console.log('AFTER SPLICE: ', arr.length)

//     arr.splice.apply(arr, [indexB, arrA.length].concat(arrA));

//     rounds--;
//   }

//   return arr;
// }






var images = fs.readdirSync(SOURCE_IMAGES_DIR);

var shuffledImages;
// shuffledImages = shuffle.riffle(images);
// shuffledImages = shuffle.overhand(images, {
//   rounds: 3,
// });
// shuffledImages = shuffle(images, [
//   // 'overhand',
//   // 'overhand',
//   // 'riffle',
//   // 'riffle',
//   // {
//   //   type: 'overhand',
//   //   rounds: 7,
//   // },
//   'pile',
//   'pile',
//   // 'riffle',
// ]);


// MONGEAN TEST
// shuffledImages = shuffle(images.slice(0, 52), createArray(12, 'mongean'))

// FARO TEST
shuffledImages = shuffle(images.slice(0, 52), createArray(26, 'faro'))


// var shuffledImages = shuffleArray(images, {
//   rounds: 1,
//   groupSize: 90,
// });

// shuffledImages = shuffledImages.map((img, index) => {
//   if (img !== images[index]) {
//     return path.parse(img).name + '-shuffled' + path.parse(img).ext;
//   } else {
//     return img;
//   }
// })

console.log(shuffledImages.length);

// console.log(images);

fs.writeFileSync(
  path.join(__dirname, 'shuffled-images.json'),
  JSON.stringify(shuffledImages, null, '  '),
  'utf8'
);

