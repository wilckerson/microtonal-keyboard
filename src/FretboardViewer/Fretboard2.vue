<template>
  <div class="fretboard-viewer">
    <div class="fretboard-wrapper">
      <div class="strings-tuning">
        <div class="string-tuning-row" v-for="(_, idx) in stringsTuningIdx" v-bind:key="'string-tuning-row-' + idx">
          <input type="number" v-model="stringsTuningIdx[idx]" />
        </div>
      </div>
      <div class="fretboard-scroller">
        <div class="fretboard">
          <div v-for="(rowData, rowIdx) in fretboardData" v-bind:key="'fretboard-row-' + rowIdx" class="fretboard-row">
            <div class="string-indicator"></div>
            <audio-key v-for="(fretData, fretIdx) in rowData" v-bind:key="'fret-' + rowIdx + '-' + fretIdx"
              :class="fretIdx === 0 ? 'fret-zero' : ''" :keyName="fretData.keyName"
              :idx="'fret-' + rowIdx + '-' + fretIdx" :freq="fretData.freq" :text="fretData.text" hideFreq
              :style="'width: ' + fretData.width + '%'" />
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
- [] Fix fret positions
- [] Support negative values on string tuning index
- [] Display position ratio 
- [] Dropdown to change strign tuning input mode (index, customNoteInput) 
- [] Display active interval 
- [] Support navigate key mappings
- [] Dropdown display note as (ratio / cents)
- [] Support custom notes names
- [] Support disable frets to allow easy subset explorations
*/

import AudioKey from "../AudioKey.vue";
import CustomNotes from "../CustomNotes.vue";
import ToggleSwitch from "../ToggleSwitch.vue";
import { buildFretboardData } from "./fretboard";

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
  mounted() { },
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
  text-align: left;
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

.fretboard-viewer .key-marker-container {
  top: auto;
  bottom: 0;
  right: 0;
}

.fretboard-viewer .key {
  padding-right: 8px;
  text-align: right;
  vertical-align: top;
  display: inline-block;
  border: 0;
  border-right: 4px solid gray;
  box-sizing: border-box;
}

.fretboard-viewer .key-label {
  opacity: 0.25;
}

.fret-zero {
  border-right: 10px solid gray;
}
</style>
