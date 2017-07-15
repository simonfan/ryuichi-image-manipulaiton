/**
 * Shuffling techniques taken from:
 * https://en.wikipedia.org/wiki/Shuffling
 */

// random number fns from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// https://stackoverflow.com/questions/30492259/get-a-random-number-focused-on-center
function weightedRandom(max, numDice) {
  var num = 0;
  for (var i = 0; i < numDice; i++) {
    num += Math.random() * (max/numDice);
  }    
  return num;
}

function weightedRandomInt(max, numDice) {
  return Math.floor(weightedRandom(max, numDice));
}


const SHUFFLE_SPEC_STR_RE = /([a-zA-Z]+)(?:\:([0-9]+))?/;

var shuffle = function shuffle(arr, shuffleSpecs) {

  arr = arr.slice(0);
  
  if (!shuffleSpecs) {
    throw new Error('shuffleSpecs required');
  }

  shuffleSpecs = Array.isArray(shuffleSpecs) ? shuffleSpecs : [shuffleSpecs];

  return shuffleSpecs.reduce((result, shuffleSpec) => {

    var type;
    var rounds;

    if (typeof shuffleSpec === 'string') {
      var match = shuffleSpec.match(SHUFFLE_SPEC_STR_RE);

      if (!match) {
        throw new Error('invalid shuffle spec ' + shuffleSpec);
      }

      type = match[1];

      if (match[2]) {
        rounds = parseInt(match[2])
      }
    } else {
      type = shuffleSpec.type;
      rounds = shuffleSpec.rounds;
    }

    rounds = rounds || 1;

    while (rounds > 0) {
      result = shuffle[shuffleSpec.type](result, shuffleSpec);
      rounds--;
    }

    return result;

    // var shuffleFn = (typeof shuffleSpec === 'string') ?
    //   shuffle[shuffleSpec] : shuffle[shuffleSpec.type];


    // if (typeof shuffleSpec === 'string') {
    //   return shuffle[shuffleSpec](result);
    // } else {
    //   return shuffle[shuffleSpec.type](result, shuffleSpec);
    // }

  }, arr);
};



// auxiliary
var aux = {};

/**
 * 
 * TODO: distortion otpions
 * @param  {[type]} arr     [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
aux.groupApproximately = function (arr, options) {
  arr = arr.slice(0);

  options = options || {};
  var quantity = options.quantity;

  if (!quantity) {
    throw new Error('quantity is required');
  }
  var groups = [];

  var currentBaseGroupLength;
  var currentGroupLength;

  while (quantity > groups.length) {

    // the base group length is calculated
    // relative to the quantity of groups
    // left to be created and the quantity of items to be sorted
    currentBaseGroupLength = Math.floor(arr.length / (quantity - groups.length));

    // distort
    currentGroupLength = currentBaseGroupLength + randomInt(currentBaseGroupLength * -1/2, currentBaseGroupLength * 1/2);

    if (quantity - groups.length > 1) {
      groups.push(arr.splice(0, currentGroupLength));
    } else {
      // remaining items go to the last group
      groups.push(arr);
    }
  }

  return groups;
};


shuffle.overhand = function (arr, options) {
  arr = arr.slice(0);

  options = options || {};

  // var groupSize = options.groupSize || randomInt(0, arr.length);
  var cuts = options.cuts || 1;

  var groups = aux.groupApproximately(arr, {
    quantity: cuts + 1,
  });

  // reverse concatenate
  return groups.reduce((result, g, index) => {

    return g.concat(result);

  }, []);

  // return [];
};

shuffle.riffle = function (arr) {
  arr = arr.slice(0);

  var splitAt = weightedRandomInt(arr.length, 50);

  console.log('splitAt', splitAt);

  var halfA = arr.slice(0, splitAt);
  var halfB = arr.slice(splitAt, arr.length);

  var resultArr = [];
  var pickFromHalf;

  while (resultArr.length < arr.length) {

    if (halfA.length === 0) {
      // no cards on A
      pickFromHalf = halfB;
    } else if (halfB.length === 0) {
      // no cards on B
      pickFromHalf = halfA;
    } else {
      // cards available from both halves
      if (pickFromHalf === halfA) {
        // last picked from halfA, thus make it favorable
        // to pick from halfB
        pickFromHalf = Math.random() > 0.9 ? halfA : halfB;
      } else if (pickFromHalf === halfB) {
        // last picked form halfB, thus make it favorable
        // to pick from halfA
        pickFromHalf = Math.random() > 0.1 ? halfA : halfB; 

      } else {
        // first pick
        pickFromHalf = Math.random() > 0.5 ? halfA : halfB;
      }
    }

    // unshift & pop combination is very important
    resultArr.unshift(pickFromHalf.pop());
  }

  return resultArr;
};

shuffle.pile = function (arr, options) {
  arr = arr.slice(0);

  options = options || {};

  var pileCount = options.piles || 2;
  var piles = [];

  while (piles.length < pileCount) {
    piles.push([]);
  }

  var addToPileIndex = 0;

  while (arr.length > 0) {
    piles[addToPileIndex].unshift(arr.shift());

    if (addToPileIndex === piles.length - 1) {
      addToPileIndex = 0;
    } else {
      addToPileIndex++;
    }
  }

  // reverse concatenate
  // TODO: allow option
  return piles.reduce((result, p, index) => {

    return p.concat(result);

  }, []);
};

shuffle.mongean = function (arr) {
  arr = arr.slice(0);
  var result = [];
  var unshiftOrPush = 'push';

  while (arr.length > 0) {
    result[unshiftOrPush](arr.shift());

    unshiftOrPush = unshiftOrPush === 'push' ? 'unshift' : 'push';
  }

  return result;
};

shuffle.faro = function (arr) {
  arr = arr.slice(0);

  var halfA = arr.splice(0, Math.floor(arr.length / 2));
  var halfB = arr;

  var pickFromHalf = halfA.length >= halfB.length ? halfA : halfB;

  var result = [];

  while (halfA.length > 0 || halfB.length > 0) {
    result.unshift(pickFromHalf.pop());

    pickFromHalf = pickFromHalf === halfA ? halfB : halfA;
  }

  return result;
};


module.exports = shuffle;
