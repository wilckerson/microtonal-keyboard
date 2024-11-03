import {
  getScalePeriod,
  normalizeRatio,
  getKeyName,
  rotateScale,
  ratioToCents
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

export const DISPLAY_MODES = {
  DEFAULT: "DEFAULT",
  RATIO: "RATIO",
  RATIO_REDUCED: "RATIO_REDUCED",
  RATIO_RELATIVE: "RATIO_RELATIVE",
  CENTS: "CENTS",
  CENTS_REDUCED: "CENTS_REDUCED",
  CENTS_RELATIVE: "CENTS_RELATIVE",
  FREQUENCY: "FREQUENCY"
};

function buildFretData(
  ratio,
  relativeRatio,
  baseFreq,
  width,
  periodRatio,
  noteName,
  noteText,
  scaleIdx,
  displayMode = DISPLAY_MODES.DEFAULT
) {
  console.log(arguments)
  const finalRatio = ratio * relativeRatio;
  const freq = baseFreq * finalRatio;
  //Default
  let text = "";
  switch (displayMode) {
    case DISPLAY_MODES.RATIO:
      text = finalRatio.toFixed(4);
      break;
    case DISPLAY_MODES.RATIO_REDUCED:
      text = normalizeRatio(finalRatio, periodRatio).toFixed(4);
      break;
    case DISPLAY_MODES.RATIO_RELATIVE:
      text = ratio.toFixed(4);
      break;
    case DISPLAY_MODES.CENTS:
      text = ratioToCents(finalRatio).toFixed(2) + "¢";
      break;
    case DISPLAY_MODES.CENTS_REDUCED:
      text =
        ratioToCents(normalizeRatio(finalRatio, periodRatio)).toFixed(2) + "¢";
      break;
    case DISPLAY_MODES.CENTS_RELATIVE:
      text = ratioToCents(ratio).toFixed(2) + "¢";
      break;
    case DISPLAY_MODES.FREQUENCY:
      text = freq.toFixed(2) + " Hz";
      break;
    default:
      text = noteName || noteText;
      break;
  }

  return {
    text,
    freq,
    width,
    scaleIdx
  };
}

function buildFretsData(
  scale,
  baseFreq,
  relativeRatio = 1,
  noteNames = [],
  noteTexts = [],
  stringTuningIdx = 0,
  displayMode = DISPLAY_MODES.DEFAULT
) {
  const periodRatio = getScalePeriod(scale);
  const zeroFretPercentageDistance = 7;
  let lastPecentageDistance = 0;
  const result = [];
  const zeroFretScaleIdx = getScaleIdx(stringTuningIdx, scale.length);
  result.push(
    buildFretData(
      1,
      relativeRatio,
      baseFreq,
      zeroFretPercentageDistance,
      periodRatio,
      getNoteNameByStringTuningIdx(stringTuningIdx, noteNames),
      noteTexts[zeroFretScaleIdx],
      zeroFretScaleIdx,
      displayMode
    )
  );
  for (let scaleIdx = 0; scaleIdx < scale.length; scaleIdx++) {
    const ratio = scale[scaleIdx];
    let fretWidth = 0;

    const remainingPercentageDistance = 100 - zeroFretPercentageDistance;
    const fretPercentageDistance =
      remainingPercentageDistance *
      computeFretPercentageDistance(ratio, periodRatio);
    fretWidth = fretPercentageDistance - lastPecentageDistance;
    lastPecentageDistance = fretPercentageDistance;

    const relativeIdx = stringTuningIdx + scaleIdx + 1;
    const relativeScaleIdx = getScaleIdx(relativeIdx, scale.length)
    result.push(
      buildFretData(
        ratio,
        relativeRatio,
        baseFreq,
        fretWidth,
        periodRatio,
        getNoteNameByStringTuningIdx(relativeIdx, noteNames),
        noteTexts[relativeScaleIdx],
        relativeScaleIdx,
        displayMode
      )
    );
  }  
  return result;
}

export function buildFretboardData(
  baseFreq,
  scale,
  stringsTuningIdx,
  noteNames,
  noteTexts,
  displayMode
) {
  if (!scale || scale.length === 0) {
    scale = [2];
  }
  const data = stringsTuningIdx.map(stringTuningIdx => {
    const relativeRatio = getRelativeRatioByIndex(scale, stringTuningIdx);
    const relativeScale = rotateScale(scale, stringTuningIdx);
    return buildFretsData(
      relativeScale,
      baseFreq,
      relativeRatio,
      noteNames,
      noteTexts,
      stringTuningIdx,
      displayMode
    );
  });
  return applyKeyMapping(data);
}

export function getRelativeRatioByIndex(scale, index) {
  const periodRatio = getScalePeriod(scale);
  if (index === 0) {
    return 1;
  } else if (index > 0) {
    return (
      scale[(index - 1) % scale.length] *
      Math.pow(periodRatio, Math.floor((index - 1) / scale.length))
    );
  } else if (index < 0) {
    return (
      scale[scale.length - 1 - (Math.abs(index) % scale.length)] *
      Math.pow(periodRatio, -Math.ceil(Math.abs(index - 1) / scale.length))
    );
  }
  return index === 0;
}

export function getNoteNameByStringTuningIdx(stringTuningIdx, noteNames) {
  const scaleIdx = getScaleIdx(stringTuningIdx, noteNames.length);
  return noteNames[scaleIdx];
}

function getScaleIdx(index, scaleSize) {
  if (index === 0) return scaleSize - 1;
  if (index > 0) return (index - 1) % scaleSize;
  if (index < 0) return scaleSize - 1 - (Math.abs(index) % scaleSize);
}
