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
              :class="{ 'fret-zero': fretIdx === 0 }" :disabled="!subsetEnabled[fretData.scaleIdx]"
              :keyName="fretData.keyName" :idx="'fret-' + rowIdx + '-' + fretIdx" :freq="fretData.freq"
              :text="fretData.text" :style="'width: ' + fretData.width + '%'"
              :markers="getMarkersFromNoteGroups(fretData.scaleIdx)" hideFreq />
          </div>
        </div>
        <div class="fretboard-fret-numbers">
          <div class="fretboard-fret-number" v-for="(fretData, fretIdx) in fretboardData[
            fretboardData.length - 1
          ]" v-bind:key="'fret-number-' + fretIdx" :style="'width: ' + fretData.width + '%'">
            {{ fretIdx }}
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
        <label>
          Display mode:
          <select v-model="displayMode">
            <option :value="DISPLAY_MODES.DEFAULT">Default (Note name or Ratio)</option>
            <option :value="DISPLAY_MODES.RATIO">Ratio</option>
            <option :value="DISPLAY_MODES.RATIO_REDUCED">Ratio reduced by period</option>
            <option :value="DISPLAY_MODES.RATIO_RELATIVE">Ratio relative to string</option>
            <option :value="DISPLAY_MODES.CENTS">Cents (¢)</option>
            <option :value="DISPLAY_MODES.CENTS_REDUCED">Cents (¢) reduced by period</option>
            <option :value="DISPLAY_MODES.CENTS_RELATIVE">Cents (¢) relative to string</option>
            <option :value="DISPLAY_MODES.FREQUENCY">Frequency (Hz)</option>
            <option :value="DISPLAY_MODES.FRETS_DISTANCE">Frets distance (mm) from Nut</option>
          </select>
        </label>
        <div v-if="displayMode === DISPLAY_MODES.FRETS_DISTANCE">
          <label>String Length (mm): <input type="number" style="width: 70px;" :value="stringLength" min="1" max="10000"
              @change="stringLength = (Math.min(Math.max(1, parseFloat($event.target.value)), 10000) || 1)" /></label>
        </div>
        <div>
          <label>Subset enabled notes:</label>
          <note-selection-list :noteTexts="noteTexts" :noteNames="noteNames" :defaultChecked="true"
            @change="onChangeSubset" />
        </div>
        <!-- <toggle-switch v-model="normalizeDisplay" /> -->
      </div>
      <div class="control-panel">
        <label>Note highlight groups: </label>
        <note-group style="width: 350px" @change="onChangeNoteGroup" :noteTexts="noteTexts" :noteNames="noteNames"
          :selectedTemplate="selectedTemplate" />
      </div>
    </div>
  </div>
</template>

<script>
/*
TODOs: 
- [x] Fix fret positions
- [x] Support custom notes names
- [x] Support negative values on string tuning index
- [x] Support disable frets to allow easy subset explorations
- [x] Dropdown display note mode (default [note name or ratio] / ratio-normalized / cents / distance-ratio )
- [x] Custom notes templates (12edo with names, 31edo with names, etc)
- [x] Display fret numbers for lowest string
- [x] Display note text in default mode
- [x] Notes highlight group CRUD (description, notes index, color, startingNoteIndex=0 (get index from dropdown with note names))
- [x] Fret distance in mm
- [x] Note select All/None
- [x] Automatic group name (Group {idx}) instead of validation
- [x] Improved color selection
- [] Display mode "only frets"
- [] Display active interval
- [] Full frets mode based on string zero
- [] Dropdown to change strings tuning input mode (index, customNoteInput) 
- [] Display number of common frets between strings
- [] Fix play bug on touch
- [] Play with drag
- [] Strings count input
- [] Fix note frequency according to physical tunner
- [] Support navigate key mappings on active notes
- [] Total number of notes across strings
- [] URL data similar to ScaleWorkshop
- [] Template with notes highlight (Ex: Major - Ionian, Minor - Aeolian, Mixolydean, MOS, etc)
*/

import NoteSelectionList from "./NoteSelectionList.vue";
import NoteGroup from "./NoteGroup.vue";
import AudioKey from "../AudioKey.vue";
import CustomNotes from "../CustomNotes.vue";
import ToggleSwitch from "../ToggleSwitch.vue";
import { buildFretboardData, DISPLAY_MODES } from "./fretboard";

export default {
  components: { AudioKey, CustomNotes, ToggleSwitch, NoteGroup, NoteSelectionList },
  data() {
    return {
      scale: [],
      noteNames: [],
      noteTexts: [],
      subsetEnabled: [],
      noteGroups: [],
      baseFreq: 110,
      stringsTuningIdx: [0, 0, 0, 0, 0, 0],
      displayMode: DISPLAY_MODES.DEFAULT,
      DISPLAY_MODES,
      stringLength: 650,
      selectedTemplate: undefined
    };
  },
  mounted() { },
  computed: {
    fretboardData() {
      return buildFretboardData(
        this.baseFreq,
        this.scale,
        this.stringsTuningIdx,
        this.noteNames,
        this.noteTexts,
        this.displayMode,
        this.stringLength
      );
    }
  },
  methods: {
    onChangeCustomNotes(
      notes,
      noteNames,
      noteTexts,
      baseFreq,
      stringsTuningIdx,
      selectedTemplate
    ) {
      if (baseFreq) this.baseFreq = baseFreq;
      if (stringsTuningIdx) this.stringsTuningIdx = stringsTuningIdx;
      this.scale = notes;
      this.noteNames = noteNames;
      this.noteTexts = noteTexts;
      this.selectedTemplate = selectedTemplate;
    },
    onChangeSubset(selectedNotes, selectedNotesIdx) {
      this.subsetEnabled = selectedNotes;
    },
    onChangeNoteGroup(noteGroups) {
      this.noteGroups = noteGroups;
    },
    getMarkersFromNoteGroups(scaleIdx) {
      return this.noteGroups.filter(noteGroup =>
        noteGroup.enabled && noteGroup.selectedNotesIdx.includes(scaleIdx)
      ).map(noteGroup => noteGroup.color);
    },
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
  opacity: 0.4;
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
