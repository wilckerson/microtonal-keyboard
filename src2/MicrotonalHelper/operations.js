import { isRequired, isArray } from "./argumentCheck.js";

export function reduce(
  value = isRequired("value"),
  period = isRequired("period")
) {
  if (period == 1) {
    return value;
  }

  if (value >= period) {
    while (value >= period) {
      value = value / period;
    }
  } else if (value > 0 && value < 1) {
    while (value < 1) {
      value = value * period;
    }
  }
  return value;
}

export function ratioToCents(ratio) {
  return Math.log2(ratio) * 1200;
}

export function centsToRatio(cents) {
  var ratio = Math.pow(2, cents / 1200);
  return ratio;
}

export function ratiosDiffInCents(ratio1, ratio2) {
  return Math.abs(ratioToCents(ratio1) - ratioToCents(ratio2));
}

export function getClosestRatioFromScale(targetRatio, scale) {
  isRequired(targetRatio, "targetRatio");
  isRequired(scale, "scale");
  isArray(scale, "scale");

  const diffMap = scale.map((scaleRatio, scaleIndex) => ({
    scaleIndex,
    diffInCents: ratiosDiffInCents(scaleRatio, targetRatio)
  })).sort((a, b) => a.diffInCents - b.diffInCents);

  return diffMap[0];
}

function scaleFindIndexByReducedRatio(scale, ratio) {
  const period = getScalePeriod(scale);
  const reducedRatio = reduceRatio(ratio, period);
  return scale.findIndex(scaleRatio =>
    isEqualRatio(reducedRatio, reduceRatio(scaleRatio, period))
  );
}


export function computeRotations(scaleArray) {
  var result = [];
  if (scaleArray[0] !== 1) {
    scaleArray = [1, ...scaleArray];
  }
  var scaleLength = scaleArray.length - 1;
  var period = scaleArray[scaleArray.length - 1];
  for (let i = 0; i < scaleLength; i++) {
    const tmpRoot = scaleArray[i];
    var rotationArray = [];
    for (let j = 0; j < scaleLength; j++) {
      var idx = i + j + 1;
      var modIdx = idx % scaleLength;
      var idxPow = Math.floor(idx / scaleLength);
      const item = scaleArray[modIdx];
      const fixedItem = Math.pow(period, idxPow) * item;
      rotationArray.push(fixedItem / tmpRoot);
    }
    result.push(rotationArray);
  }
  return result;
}


export function unique(array) {
  var minValue = 0.00000001//0.01;
  var resultArray = [];
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    var contains = false;

    if (resultArray.length > 0) {
      for (let j = 0; j < resultArray.length; j++) {
        const element2 = resultArray[j];
        if (Math.abs(element2 - element) < minValue) {
          contains = true;
          break;
        }
      }
    }

    if (!contains) {
      resultArray.push(element);
    }
  }
  return resultArray;
};

export function iterator(min, max, increment, callback) {
  if (min >= max) {
      throw Error(
          "The max value must be greater than the min value"
      );
  }
  const iterationsCount = Math.floor((max - min) / increment);
  console.log(`Number of iterations: ${iterationsCount}`);

  var result = [];
  for (let iteration = 0; iteration <= iterationsCount; iteration++) {
      const currentValue = min + increment * iteration;
      const data = callback(currentValue)
      if (data !== undefined)
          result.push(data);
  }
  return result;
}