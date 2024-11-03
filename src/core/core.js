export function rotateScale(scale, count) {
  if (count > 0) {
    count = Math.abs(count) % scale.length;
  } else if (count < 0) {
    count = scale.length - (Math.abs(count) % scale.length);
  }
  if (count === 0) return scale;
  const scalePeriod = getScalePeriod(scale);
  const newRootRatio = scale[(count - 1) % scale.length];
  const result = [];
  for (let index = 0; index < scale.length; index++) {
    const ratio = scale[(count + index) % scale.length];
    var idxPow = Math.floor((count + index) / scale.length);
    let newRatio = (ratio * Math.pow(scalePeriod, idxPow)) / newRootRatio;
    result.push(newRatio);
  }
  return result;
}

export function getScalePeriod(scale) {
  return scale[scale.length - 1];
}

export function normalizeRatio(ratio, period) {
  if (period == 1) {
    return ratio;
  }
  if (ratio > period) {
    while (ratio > period) {
      ratio = ratio / period;
    }
  } else if (ratio > 0 && ratio < 1) {
    while (ratio < 1) {
      ratio = ratio * period;
    }
  }
  return ratio;
}

export function getKeyName(i, j) {
  var keys = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M", "¼", "¾"]
  ];
  if (i >= 0 && i < 4 && j < 9) {
    return keys[i][j];
  } else {
    return "";
  }
}

export function ratioToCents(ratio) {
  var cents = 1200 * Math.log2(parseFloat(ratio));
  return cents;
}
