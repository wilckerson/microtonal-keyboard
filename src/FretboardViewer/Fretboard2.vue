<template>
  <div>
    <div class="fretboard-wrapper">
      <div class="strings-tuning">
        <div class="string-tuning-row"><input type="number" /></div>
        <div class="string-tuning-row"><input type="number" /></div>
      </div>
      <div class="fretboard-scroller">
        <div class="fretboard">
          <div
            v-for="(rowData, rowIdx) in fretboardData"
            v-bind:key="'fretboard-row-' + rowIdx"
            class="fretboard-row"
          >
            <div class="string-indicator"></div>
            <audio-key
              v-for="(fretData, fretIdx) in rowData"
              v-bind:key="'fret-' + rowIdx + '-' + fretIdx"
              :class="fretIdx === 0 ? 'fret-zero' : ''"
              :keyName="fretData.keyName"
              :idx="'fret-' + rowIdx + '-' + fretIdx"
              :freq="fretData.freq"
              :text="fretData.text"
              hideFreq
              :style="'width: ' + fretData.width + '%'"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="control-panels">
      <div class="control-panel">Control 1</div>
      <div class="control-panel">Control 2</div>
    </div>
  </div>
</template>

<script>
import AudioKey from "../AudioKey.vue";
export default {
  components: { AudioKey },
  data() {
    return {
      fretboardData: []
    };
  },
  mounted() {
    this.fretboardData = buildFretboardData();
  }
};

function getKeyName(i, j) {
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

function applyKeyMapping(fretboardData) {
  return fretboardData.map((rowData, rowIdx) =>
    rowData.map((fretData, fretIdx) => ({
      ...fretData,
      keyName: getKeyName(rowIdx, fretIdx)
    }))
  );
}

function computeFretPercentageDistance(ratio, periodRatio) {
  return Math.log(ratio) / Math.log(periodRatio);
}

function buildFretsData(scale, baseFreq) {
  const periodRatio = getScalePeriod(scale);
  const zeroFretPercentageDistance = 5;
  let lastPecentageDistance = zeroFretPercentageDistance;
  const result = [];
  result.push({
    text: (1).toFixed(4),
    freq: baseFreq,
    width: zeroFretPercentageDistance
  });

  for (let ratioIdx = 0; ratioIdx < scale.length; ratioIdx++) {
    const ratio = scale[ratioIdx];
    let fretWidth = 0;

    const remainingPercentageDistance = 100 - zeroFretPercentageDistance;
    const fretPercentageDistance =
      remainingPercentageDistance *
      computeFretPercentageDistance(ratio, periodRatio);
    fretWidth = fretPercentageDistance - lastPecentageDistance;
    lastPecentageDistance = fretPercentageDistance;

    result.push({
      text: ratio.toFixed(4),
      freq: baseFreq * ratio,
      width: fretWidth
    });
  }
  return result;
}

function buildFretboardData(scale, stringsTuningIdx) {
  scale = [1.25,1.5, 2];
  stringsTuningIdx = [3, 2,1,0];
  const baseFreq = 220;
  const data = stringsTuningIdx.map(stringTuningIdx => {
    const relativeScale = rotateScale(scale, stringTuningIdx);
    console.log(relativeScale);
    return buildFretsData(relativeScale, baseFreq);
  });
  return applyKeyMapping(data);
}

// function rotateScale(scale, startIdx) {
//   const scalePeriod = getScalePeriod(scale);
//   const scaleNoPeriod = scale.slice(0, scale.length - 1);
//   const newRootRatio = scaleNoPeriod[startIdx % scaleNoPeriod.length];
//   const result = [];
//   for (let index = 0; index < scaleNoPeriod.length; index++) {
//     const ratio = scaleNoPeriod[(startIdx + index) % scaleNoPeriod.length];
//     const newRatio = normalizeRatio(ratio / newRootRatio, scalePeriod);
//     result.push(newRatio);
//   }
//   result.push(scalePeriod);
//   return result;
// }

function rotateScale(scale, count) {
  if (count < 0)
    throw Error(
      "Invalid parameter count. It should be greather than or equal to zero."
    );
  count = count % scale.length;
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

function normalizeRatio(ratio, period) {
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

function getScalePeriod(scale) {
  return scale[scale.length - 1];
}
</script>

<style>
/* ======== Control cards ======== */
.control-panels {
  display: flex;
}

.control-panel {
  flex-grow: 1;
}
/* ======== String tuning ======== */
.strings-tuning {
  flex: 0;
  padding-right: 8px;
}

.string-tuning-row {
  height: 57px;
  margin-top: 12px;
}

.string-tuning-row input {
  width: 50px;
}

/* ======== Fretboard ======== */
.fretboard-wrapper {
  display: flex;
}
.fretboard-scroller {
  flex: 1;
  overflow-x: auto;
}
.fretboard {
  border: 1px solid #d3d0c7;
  background-color: #f0eee9;
  /* width: 900px; */
}

.fretboard-row {
  position: relative;
}

.string-indicator {
  background-color: gray;
  height: 3px;
  width: 100%;
  top: 53%;
  position: absolute;
  opacity: 0.3;
}

/* ======== Fret ======== */

.key-marker-container {
  top: auto;
  bottom: 0;
  right: 0;
}

.key {
  padding-right: 8px;
  text-align: right;
  vertical-align: top;
  display: inline-block;
  border: 0;
  border-right: 4px solid gray;
  box-sizing: border-box;
}

.key-label {
  opacity: 0.25;
}

.fret-zero {
  border-right: 10px solid gray;
}
</style>
