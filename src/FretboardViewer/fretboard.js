import {
  getScalePeriod,
  normalizeRatio,
  getKeyName,
  rotateScale
} from "./core";

function applyKeyMapping(fretboardData) {
  return fretboardData.map((rowData, rowIdx) =>
    rowData.map((fretData, fretIdx) => ({
      ...fretData,
      keyName: getKeyName(rowIdx, fretIdx)
    }))
  );
}

function computeFretPercentageDistance(ratio, periodRatio) {
  const periodDistance = 100 - 100 / periodRatio;
  const ratioDistance = 100 - 100 / ratio;
  return ratioDistance / periodDistance;
}

function buildFretData(ratio, baseFreq, width, normalizeDisplay, periodRatio) {
  const displayRatio = normalizeDisplay
    ? normalizeRatio(ratio, periodRatio)
    : ratio;
  return {
    text: displayRatio.toFixed(4),
    freq: baseFreq * ratio,
    width: width
  };
}

function buildFretsData(
  scale,
  baseFreq,
  relativeRatio = 1,
  normalizeDisplay = false
) {
  const periodRatio = getScalePeriod(scale);
  const zeroFretPercentageDistance = 5;
  let lastPecentageDistance = 0;
  const result = [];
  result.push(
    buildFretData(
      relativeRatio,
      baseFreq,
      zeroFretPercentageDistance,
      normalizeDisplay,
      periodRatio
    )
  );
  debugger;
  for (let ratioIdx = 0; ratioIdx < scale.length; ratioIdx++) {
    const ratio = scale[ratioIdx];
    let fretWidth = 0;

    const remainingPercentageDistance = 100 - zeroFretPercentageDistance;
    const fretPercentageDistance =
      remainingPercentageDistance *
      computeFretPercentageDistance(ratio, periodRatio);
    fretWidth = fretPercentageDistance - lastPecentageDistance;
    lastPecentageDistance = fretPercentageDistance;

    result.push(
      buildFretData(
        ratio * relativeRatio,
        baseFreq,
        fretWidth,
        normalizeDisplay,
        periodRatio
      )
    );
  }
  return result;
}

export function buildFretboardData(
  baseFreq,
  scale,
  stringsTuningIdx,
  normalizeDisplay
) {
  if (!scale || scale.length === 0) {
    scale = [2];
  }
  const periodRatio = getScalePeriod(scale);
  const data = stringsTuningIdx.map(stringTuningIdx => {
    const relativeRatio =
      stringTuningIdx === 0
        ? 1
        : scale[(stringTuningIdx - 1) % scale.length] *
          Math.pow(
            periodRatio,
            Math.floor((stringTuningIdx - 1) / scale.length)
          );

    const relativeScale = rotateScale(scale, stringTuningIdx);
    return buildFretsData(
      relativeScale,
      baseFreq,
      relativeRatio,
      normalizeDisplay
    );
  });
  return applyKeyMapping(data);
}
