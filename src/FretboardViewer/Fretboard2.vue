<template>
  <div class="fretboard-viewer">
    <div class="fretboard-wrapper">
      <div class="strings-tuning">
        <div class="string-tuning-row" v-for="(_, idx) in stringsTuningIdx" v-bind:key="'string-tuning-row-' + idx">
          <input type="number" v-model.number="stringsTuningIdx[idx]" />
        </div>
      </div>
      <div class="fretboard-scroller">
        <div class="fretboard">
          <div v-for="(rowData, rowIdx) in fretboardData" v-bind:key="'fretboard-row-' + rowIdx" class="fretboard-row">
            <div class="string-indicator"></div>
            <audio-key v-for="(fretData, fretIdx) in rowData" v-bind:key="'fret-' + rowIdx + '-' + fretIdx"
              :class="fretIdx === 0 ? 'fret-zero' : ''" :keyName="fretData.keyName"
              :idx="'fret-' + rowIdx + '-' + fretIdx" :freq="fretData.freq" :text="fretData.text"
              :style="'width: ' + fretData.width + '%'" hideFreq />
          </div>
        </div>
        <div class="fretboard-fret-numbers">
          <div class="fretboard-fret-number" v-for="(fretData, fretIdx) in fretboardData[fretboardData.length - 1]"
            v-bind:key="'fret-number-' + rowIdx + '-' + fretIdx" :style="'width: ' + fretData.width + '%'">{{ fretIdx }}
          </div>
        </div>
      </div>
    </div>
    <div class="control-panels">
      <div class="control-panel">
        <label>
          Base frequency (Hz):
          <input type="number" v-model.number="baseFreq" style="width: 70px;" />
        </label>
        <custom-notes @change="onChangeCustomNotes" />
      </div>
      <div class="control-panel">
        <div>
          <span>Normalize display:</span>
          <input type="checkbox" v-model="normalizeDisplay" />
          <!-- <toggle-switch v-model="normalizeDisplay" /> -->
        </div>

      </div>
      <div class="control-panel"></div>
    </div>
  </div>
</template>

<script>
/*
TODOs: 
- [x] Fix fret positions
- [x] Support custom notes names
- [x] Support negative values on string tuning index
- [] Support disable frets to allow easy subset explorations
- [] Support navigate key mappings
- [] Display active interval 
- [] Dropdown display note mode (default [note name or ratio] / ratio-normalized / cents / distance-ratio )
- [] Dropdown to change strings tuning input mode (index, customNoteInput) 
- [x] Custom notes templates (12edo with names, 31edo with names, etc)
- [x] Display fret numbers for lowest string
- [] URL data similar to ScaleWorkshop
*/

import AudioKey from "../AudioKey.vue";
import CustomNotes from "../CustomNotes.vue";
import ToggleSwitch from "../ToggleSwitch.vue";
import { buildFretboardData } from "./fretboard";

export default {
  components: { AudioKey, CustomNotes, ToggleSwitch },
  data() {
    return {
      scale: [],
      noteNames: [],
      baseFreq: 110,
      stringsTuningIdx: [0, 0, 0, 0, 0, 0],
      normalizeDisplay: false,
    };
  },
  mounted() {
  },
  computed: {
    fretboardData() {
      return buildFretboardData(
        this.baseFreq,
        this.scale,
        this.stringsTuningIdx,
        this.normalizeDisplay,
        this.noteNames
      );
    }
  },
  methods: {
    onChangeCustomNotes(notes, noteNames, baseFreq, stringsTuningIdx) {
      if (baseFreq) this.baseFreq = baseFreq;
      if (stringsTuningIdx) this.stringsTuningIdx = stringsTuningIdx;
      this.scale = notes;
      this.noteNames = noteNames;
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
  padding-right: 6px;
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

.fretboard-viewer .fret-zero {
  border-right: 10px solid gray;
}

.fretboard-fret-number {
  font-size: 12px;
  display: inline-block;
  text-align: right;
}
</style>
