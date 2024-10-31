<template>
  <div>
    <div class="fretboard-wrapper">
      <div class="strings-tuning">
        <div
          class="string-tuning-row"
          v-for="(_, idx) in stringsTuningIdx"
          v-bind:key="'string-tuning-row-' + idx"
        >
          <input type="number" v-model="stringsTuningIdx[idx]" />
        </div>
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
      <div class="control-panel">
        <custom-notes @change="onChangeCustomNotes" />
      </div>
      <div class="control-panel">
        <div>
          <span>Normalize display:</span>
          <input type="checkbox" v-model="normalizeDisplay" />
          <!-- <toggle-switch v-model="normalizeDisplay" /> -->
        </div>
        <div>
          Base frequency (Hz):
          <input type="number" v-model="baseFreq" style="width: 70px;" />
        </div>
      </div>
      <div class="control-panel"></div>
    </div>
  </div>
</template>

<script>
/*
TODOs: 
- [] Support negative values on string tuning index
- [] Display position ratio 
- [] Dropdown to change strign tuning input mode (index, customNoteInput) 
- [] Display active interval 
- [] Support navigate key mappings
- [] Dropdown display note as (ratio / cents)
*/

import AudioKey from "../AudioKey.vue";
import CustomNotes from "../CustomNotes.vue";
import ToggleSwitch from "../ToggleSwitch.vue";
export default {
  components: { AudioKey, CustomNotes, ToggleSwitch },
  data() {
    return {
      scale: [9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8, 2 / 1],
      baseFreq: 220,
      stringsTuningIdx: [0, 0, 0, 0],
      normalizeDisplay: false
    };
  },
  mounted() {},
  computed: {
    fretboardData() {
      return buildFretboardData(
        this.baseFreq,
        this.scale,
        this.stringsTuningIdx.map(x => parseInt(x)),
        this.normalizeDisplay
      );
    }
  },
  methods: {
    onChangeCustomNotes(notes) {
      this.scale = notes;
    }
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
  let lastPecentageDistance = zeroFretPercentageDistance;
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

function buildFretboardData(
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
  margin-top: 24px;
  text-align: left;
  flex-grow: 1;
}
/* ======== String tuning ======== */
.strings-tuning {
  flex: 0;
  padding-right: 6px;
}

.string-tuning-row {
  height: 57px;
  padding-top: 20px;
  box-sizing: border-box;
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
  min-width: 900px;
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
