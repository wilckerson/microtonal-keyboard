<template>
  <div class="fretboard-viewer">
    <div class="toolbar">
      <div>Strings Tuning mode: <select v-model="stringTuningMode"
          @change="onChangeStringTuningMode($event.target.value)">
          <option value="index">By index</option>
          <option value="ratio">By ratio</option>
          <!-- <option value="cents">By cents</option> -->
        </select></div>
      <div>Scroll position: <input type="number" v-model.number="baseIndex" /></div>
    </div>
    <div class="fretboard-wrapper">
      <div class="strings-tuning">

        <div v-if="stringTuningMode === 'index'" class="string-tuning-row" v-for="(_, idx) in stringsTuningIdx"
          v-bind:key="'string-tuningByIdx-row-' + idx">
          <input type="number" v-model.number="stringsTuningIdx[idx]" />
        </div>

        <div v-if="stringTuningMode === 'ratio'" class="string-tuning-row" v-for="(_, idx) in stringsTuningRatio"
          v-bind:key="'string-tuningByRatio-row-' + idx">
          <input type="number" step="0.001" v-model.number="stringsTuningRatio[idx]" />
        </div>

        <!-- <div v-if="stringTuningMode === 'cents'" class="string-tuning-row" v-for="(_, idx) in stringsTuningCents"
          v-bind:key="'string-tuningByCents-row-' + idx">
          <input type="number" v-model.number="stringsTuningCents[idx]" />
        </div> -->
      </div>
      <div class="fretboard-scroller">
        <div class="fretboard">
          <div v-for="(rowData, rowIdx) in fretboardData" v-bind:key="'fretboard-row-' + rowIdx" class="fretboard-row">
            <div class="string-indicator"></div>
            <audio-key v-for="(fretData, fretIdx) in rowData" v-bind:key="'fret-' + rowIdx + '-' + fretIdx"
              :class="{ 'fret-zero': fretIdx === 0 }" :disabled="isFretDisabled(fretIdx, fretData.scaleIdx)"
              :keyName="getKeyNameForEnabledFret(rowIdx, fretIdx, fretData.scaleIdx)"
              :idx="'fret-' + rowIdx + '-' + fretIdx" :freq="fretData.freq" :text="fretData.text"
              :style="'width: ' + fretData.width + '%'" :markers="getMarkersFromNoteGroups(fretData.scaleIdx)"
              :isDragging="isDragging" @key-mousedown="handleKeyMouseDown" @key-mouseenter="handleKeyMouseEnter"
              @key-mouseup="handleKeyMouseUp" hideFreq />

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
            <!-- <option :value="DISPLAY_MODES.FULL_FRETS">Full frets</option> -->
          </select>
        </label>
        <div v-if="displayMode === DISPLAY_MODES.FRETS_DISTANCE">
          <label>String Length (mm): <input type="number" style="width: 70px;" :value="stringLength" min="1" max="10000"
              @change="stringLength = (Math.min(Math.max(1, parseFloat($event.target.value)), 10000) || 1)" /></label>
        </div>
        <div>
          <input type="checkbox" v-model="fullFrets" />
          Full frets only
        </div>
        <div>
          <label>Subset enabled notes:</label>
          <div style="margin: 4px 0;">
            <button @click="selectAllNotes">Select All</button>
            <button @click="selectNoneNotes">Select None</button>
            <button @click="toggleScaleOptions">
              <span v-if="!showScaleOptions">Show scale options</span>
              <span v-if="showScaleOptions">Close scale options</span>
            </button>
            <button @click="rotateSelectedNotes">Rotate (modes)</button>
          </div>
          <scale-options :noteNames="noteNames" :noteTexts="noteTexts" v-show="showScaleOptions"
            :selectedTemplate="selectedTemplate" @onApplyScale="onApplyScaleToSubset" />
          <div v-if="useCircleOfFifthViewer" style="margin: 4px 0;">
            <label style="margin-right: 8px;">
              <input type="radio" value="list" v-model="noteSelectionViewMode" />
              List
            </label>
            <label>
              <input type="radio" value="circle" v-model="noteSelectionViewMode" />
              Circle of Fifths
            </label>
          </div>
          <note-selection-list v-show="noteSelectionViewMode === 'list'"
            :noteTexts="noteTexts" :noteNames="fullFrets ? [] : noteNames" :defaultChecked="true"
            @change="onChangeSubset" :useScaleOptions="true" :selectedTemplate="selectedTemplate"
            :skipFretting="skipFretting" :externalSelectedNotes="subsetEnabled" :hideActions="true" />
          <circle-of-fifths v-show="noteSelectionViewMode === 'circle'"
            :selectedNotes="subsetEnabled"
            :noteTexts="noteTexts"
            :noteNames="noteNames"
            :edoIdx_Fifth="edoIdx_Fifth"
            @toggle="onCircleToggle" />
        </div>
        <!-- <toggle-switch v-model="normalizeDisplay" /> -->
      </div>
      <div class="control-panel">
        <div>
          <input type="checkbox" v-model="displayUniqueNotes" /> Display unique notes
          <div v-if="displayUniqueNotes">Total: {{ getUniqueNotes.length }}</div>
          <div v-if="displayUniqueNotes" style="max-width: 350px">Notes: {{
            getUniqueNotes
          }}</div>
        </div>
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
- [x] Full frets mode based on string zero
- [] Dropdown to change strings tuning input mode (index, customNoteInput) 
- [] Input number to control the base index position (like capo)
- [] Display number of common frets between strings
- [] Fix play bug on touch
- [] Play with drag
- [] Strings count input
- [] Fix note frequency according to physical tunner
- [] Support navigate key mappings on active notes
- [x] Key mappings on enabled notes
- [x] Total number of notes across strings
- [] URL data similar to ScaleWorkshop
- [x] Template with notes highlight (Ex: Major - Ionian, Minor - Aeolian, Mixolydean, MOS, etc)
*/

import NoteSelectionList from "./NoteSelectionList.vue";
import NoteGroup from "./NoteGroup.vue";
import AudioKey from "../AudioKey.vue";
import CustomNotes from "../CustomNotes.vue";
import ToggleSwitch from "../ToggleSwitch.vue";
import CircleOfFifths from "./CircleOfFifths.vue";
import ScaleOptions from "./ScaleOptions.vue";
import { buildFretboardData, buildFretboardDataByRatios, DISPLAY_MODES } from "./fretboard";
import { unique, getKeyName, rotateScale } from "../core/core.js";

export default {
  components: { AudioKey, CustomNotes, ToggleSwitch, NoteGroup, NoteSelectionList, CircleOfFifths, ScaleOptions },
  data() {
    return {
      scale: [],
      noteNames: [],
      noteTexts: [],
      subsetEnabled: [],
      noteGroups: [],
      baseFreq: 110,
      stringsTuningIdx: [0, 0, 0, 0, 0, 0],
      stringsTuningRatio: [1, 1, 1, 1, 1, 1],
      stringsTuningCents: [0, 0, 0, 0, 0, 0],
      displayMode: DISPLAY_MODES.DEFAULT,
      DISPLAY_MODES,
      stringLength: 650,
      selectedTemplate: undefined,
      fullFrets: false,
      displayUniqueNotes: false,
      skipFretting: [],
      baseIndex: 0,
      stringTuningMode: 'index',
      isDragging: false, // Track global mouse button state for drag-and-play
      lastTouchedKey: null, // Track the last key touched for touch drag-to-play
      isEdo: false,
      edoIdx_Fifth: undefined,
      useCircleOfFifthViewer: false,
      noteSelectionViewMode: 'list',
      showScaleOptions: false,
    };
  },
  mounted() {
    // Add global mouse event listeners for drag-and-play
    window.addEventListener('mouseup', this.handleGlobalMouseUp);
    // Add global touch move listener for touch drag-to-play
    window.addEventListener('touchmove', this.handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', this.handleGlobalTouchEnd);
  },
  beforeDestroy() {
    // Clean up global event listeners
    window.removeEventListener('mouseup', this.handleGlobalMouseUp);
    window.removeEventListener('touchmove', this.handleGlobalTouchMove);
    window.removeEventListener('touchend', this.handleGlobalTouchEnd);
  },
  computed: {
    fretboardData() {
      return this.buildFretboardDataByStringTuningMode();
    },
    getUniqueNotes() {
      const data = this.buildFretboardDataByStringTuningMode(DISPLAY_MODES.RATIO_REDUCED);
      const ratios = data.map(stringNotes => stringNotes.filter((fretData, fretIdx) => !this.isFretDisabled(fretIdx, fretData.scaleIdx)))
        .flat().map(item => parseFloat(item.text)).sort();
      const result = unique(ratios);
      if (result[0] === 1 && result[result.length - 1] === 2) {
        result.pop(); //Removing ratio 2 from the end
      }
      return result;
    },

  },
  methods: {
    buildFretboardDataByStringTuningMode(overrideDisplayMode = undefined) {
      if (this.stringTuningMode === 'index') {
        return buildFretboardData(
          this.baseFreq,
          this.scale,
          this.stringsTuningIdx,
          this.noteNames,
          this.noteTexts,
          overrideDisplayMode || this.displayMode,
          this.stringLength,
          this.fullFrets,
          this.baseIndex
        );
      }
      else if (this.stringTuningMode === 'ratio') {
        return buildFretboardDataByRatios(
          this.baseFreq,
          this.scale,
          this.stringsTuningRatio,
          this.noteNames,
          this.noteTexts,
          overrideDisplayMode || this.displayMode,
          this.stringLength,
          this.fullFrets,
          this.baseIndex
        );
      }
      else if (this.stringTuningMode === 'cents') {
        return [];
      }
    },
    getKeyNameForEnabledFret(rowIdx, fretIdx, fretScaleIdx) {
      const startFrom = this.fullFrets ? 0 : fretScaleIdx - fretIdx;
      const enabledRotated = [
        ...this.subsetEnabled.slice(startFrom, this.subsetEnabled.length),
        ...this.subsetEnabled.slice(0, startFrom),
      ];
      const isDisabled = this.isFretDisabled(fretIdx, fretScaleIdx);
      let keyName = '';
      if (!isDisabled) {
        const enabledCountsUpToIndex = enabledRotated.slice(0, fretIdx).filter(item => item === true).length;
        keyName = getKeyName(rowIdx, enabledCountsUpToIndex);
      }
      return keyName;
    },
    isFretDisabled(fretIdx, fretScaleIdx) {
      if (this.fullFrets) {
        if (fretIdx === 0) return false;
        return !this.subsetEnabled[fretIdx - 1];
      }
      else {
        return !this.subsetEnabled[fretScaleIdx];
      }
    },
    onChangeCustomNotes(
      notes,
      noteNames,
      noteTexts,
      baseFreq,
      stringsTuningIdx,
      selectedTemplate,
      fullFrets,
      skipFretting,
      isEdo,
      edoIdx_Fifth,
      useCircleOfFifthViewer
    ) {
      if (baseFreq) this.baseFreq = baseFreq;
      if (stringsTuningIdx) this.stringsTuningIdx = stringsTuningIdx;
      this.scale = notes;
      this.noteNames = noteNames;
      this.noteTexts = noteTexts;
      this.selectedTemplate = selectedTemplate;
      this.fullFrets = fullFrets;
      this.skipFretting = skipFretting;
      this.isEdo = !!isEdo;
      this.edoIdx_Fifth = edoIdx_Fifth;
      this.useCircleOfFifthViewer = !!useCircleOfFifthViewer;
      if (!this.useCircleOfFifthViewer) {
        this.noteSelectionViewMode = 'list';
      }
    },
    onChangeSubset(selectedNotes, selectedNotesIdx) {
      this.subsetEnabled = selectedNotes;
    },
    onCircleToggle(chromaticIndex) {
      const updated = [...this.subsetEnabled];
      updated[chromaticIndex] = !updated[chromaticIndex];
      this.subsetEnabled = updated;
    },
    selectAllNotes() {
      this.subsetEnabled = this.subsetEnabled.map(() => true);
    },
    selectNoneNotes() {
      this.subsetEnabled = this.subsetEnabled.map(() => false);
    },
    rotateSelectedNotes() {
      const [first, ...rest] = this.subsetEnabled;
      this.subsetEnabled = [...rest, first];
    },
    toggleScaleOptions() {
      this.showScaleOptions = !this.showScaleOptions;
    },
    onApplyScaleToSubset(scaleDegrees, clearOnApply) {
      const newSelected = this.subsetEnabled.map(v => clearOnApply ? false : v);
      scaleDegrees.forEach(idx => { newSelected[idx] = true; });
      this.subsetEnabled = newSelected;
    },
    onChangeNoteGroup(noteGroups) {
      this.noteGroups = noteGroups;
    },
    getMarkersFromNoteGroups(scaleIdx) {
      return this.noteGroups.filter(noteGroup =>
        noteGroup.enabled && noteGroup.selectedNotesIdx.includes(scaleIdx)
      ).map(noteGroup => noteGroup.color);
    },
    onChangeStringTuningMode(newMode) {
      if (newMode === 'ratio') {
        this.displayMode = DISPLAY_MODES.RATIO;
      }
    },
    handleKeyMouseDown() {
      this.isDragging = true;
    },
    handleKeyMouseEnter(keyComponent) {
      // The key component already handles playing the sound when isDragging is true
      // This handler is just for any additional parent-level logic if needed
    },
    handleKeyMouseUp() {
      this.isDragging = false;
    },
    handleGlobalMouseUp() {
      // Reset drag state when mouse button is released anywhere
      this.isDragging = false;
    },
    handleGlobalTouchMove(e) {
      // Handle touch drag-to-play
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);

        if (elementAtPoint) {
          // Find the closest .key element
          const keyElement = elementAtPoint.closest('.key');

          if (keyElement && keyElement.__vue__) {
            const keyComponent = keyElement.__vue__;

            // Check if this is a different key than the last one touched
            if (this.lastTouchedKey !== keyComponent) {
              // Deactivate the previous key
              if (this.lastTouchedKey && this.lastTouchedKey.isTouching) {
                this.lastTouchedKey.isTouching = false;
                this.lastTouchedKey.active = false;
                this.lastTouchedKey.stopSoundNote();
              }

              // Activate the new key if it's not disabled
              if (!keyComponent.disabled) {
                keyComponent.isTouching = true;
                keyComponent.active = true;
                keyComponent.playSoundNote();
                this.lastTouchedKey = keyComponent;
              }
            }
          }
        }
      }
    },
    handleGlobalTouchEnd() {
      // Clean up when touch ends
      if (this.lastTouchedKey) {
        this.lastTouchedKey.isTouching = false;
        this.lastTouchedKey.active = false;
        this.lastTouchedKey.stopSoundNote();
        this.lastTouchedKey = null;
      }
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

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
</style>
