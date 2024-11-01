import {
  getScalePeriod,
  normalizeRatio,
  getKeyName,
  rotateScale
} from "../core/core";

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

function buildFretData(
  ratio,
  baseFreq,
  width,
  normalizeDisplay,
  periodRatio,
  noteName
) {
  const displayRatio = normalizeDisplay
    ? normalizeRatio(ratio, periodRatio)
    : ratio;
  return {
    text: noteName || displayRatio.toFixed(4),
    freq: baseFreq * ratio,
    width: width
  };
}

function buildFretsData(
  scale,
  baseFreq,
  relativeRatio = 1,
  normalizeDisplay = false,
  noteNames = [],
  stringTuningIdx = 0
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
      periodRatio,
      noteNames[
        stringTuningIdx > 0
          ? (stringTuningIdx - 1) % noteNames.length
          : noteNames.length - 1
      ]
    )
  );
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
        periodRatio,
        noteNames[(stringTuningIdx + ratioIdx) % noteNames.length]
      )
    );
  }
  return result;
}

export function buildFretboardData(
  baseFreq,
  scale,
  stringsTuningIdx,
  normalizeDisplay,
  noteNames
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
      normalizeDisplay,
      noteNames,
      stringTuningIdx
    );
  });
  return applyKeyMapping(data);
}
