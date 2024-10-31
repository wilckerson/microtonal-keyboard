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
              :style="'width: ' + fretData.width"
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

function buildFretboardData() {
  const data = [
    [
      { text: "D", freq: 210, width: "10%", keyName: "" },
      { text: "E", freq: 220, width: "25%", keyName: "" },
      { text: "F", freq: 230, width: "65%", keyName: "" }
    ],
    [
      { text: "A", freq: 110, width: "10%", keyName: "" },
      { text: "B", freq: 120, width: "70%", keyName: "" },
      { text: "C", freq: 130, width: "20%", keyName: "" }
    ],
    [
      { text: "E", freq: 80, width: "10%", keyName: "" },
      { text: "F", freq: 90, width: "30%", keyName: "" },
      { text: "F#", freq: 100, width: "60%", keyName: "" }
    ]
  ];
  return applyKeyMapping(data);
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
