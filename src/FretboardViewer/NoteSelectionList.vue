<template>
  <div>
    <template v-if="!hideActions">
      <button @click="selectAll">Select All</button>
      <button @click="selectNone">Select None</button>
      <button v-if="useScaleOptions" @click="toggleShowScaleOptions">
        <span v-if="!showScaleOptions">Show scale options</span>
        <span v-if="showScaleOptions">Close scale options</span>
      </button>
      <button @click="rotateSelected">Rotate (modes)</button>

      <scale-options :noteNames="noteNames" :noteTexts="noteTexts" v-show="showScaleOptions"
        :selectedTemplate="selectedTemplate" @onApplyScale="onApplyScale" />
    </template>

    <table>
      <tr v-for="(noteText, idx) in noteTexts" v-bind:key="'note-selection-' + idx">
        <td>
          <input type="checkbox" v-model="selectedNotes[idx]" @change="onChangeSelectedNote" />
        </td>
        <td>{{ noteText }}</td>
        <td style="padding-left:6px;">
          {{ noteNames && noteNames[idx] }}
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
import ScaleOptions from "./ScaleOptions.vue"
export default {
  components: { ScaleOptions },
  props: {
    noteTexts: Array,
    noteNames: Array,
    defaultChecked: Boolean,
    initialSelectedNotesIdx: Array,
    useScaleOptions: Boolean,
    selectedTemplate: String,
    skipFretting: Array,
    externalSelectedNotes: Array,
    hideActions: Boolean,
  },
  data() {
    return {
      showScaleOptions: false,
      selectedNotes: [],
    }
  },
  mounted() {
    this.populateNotes();

  },
  watch: {
    noteTexts: function (newValue, oldValue) {
      if (!newValue || newValue.toString() === oldValue.toString()) return;
      this.populateNotes();
      this.emitChange();
    },
    externalSelectedNotes: function (newValue) {
      if (!newValue) return;
      if (newValue.toString() !== this.selectedNotes.toString()) {
        this.selectedNotes = [...newValue];
      }
    },
  },
  methods: {
    toggleShowScaleOptions() {
      this.showScaleOptions = !this.showScaleOptions;
    },
    onChangeSelectedNote() {
      this.emitChange();
    },
    populateNotes() {

      const skipFretting = this.skipFretting || [];
      if (skipFretting.length > 0) {
        const skipValue = skipFretting[0]; //TODO: Handle multi-skipping later
        const selectedNotesArray = Array(this.noteTexts.length);
        for (let i = 0; i < selectedNotesArray.length; i++) {
          selectedNotesArray[i] = (i + 1) % skipValue === 0;
        }
        this.selectedNotes = selectedNotesArray;
      } else if (this.initialSelectedNotesIdx) {
        const selectedNotesArray = Array(this.noteTexts.length).fill(false);
        this.initialSelectedNotesIdx.forEach(idx => {
          selectedNotesArray[idx] = true;
        });
        this.selectedNotes = selectedNotesArray;
      } else {
        this.selectedNotes = Array(this.noteTexts.length).fill(this.defaultChecked);
      }
    },
    emitChange() {
      const selectedNotesIdx = this.selectedNotes
        .map((isSelected, index) => isSelected ? index : null)
        .filter(value => value != null);

      this.$emit('change', this.selectedNotes, selectedNotesIdx);
    },
    selectAll() {
      const newSelectedNotes = this.selectedNotes.map(i => true);
      this.selectedNotes = newSelectedNotes;
      this.emitChange();
    },
    selectNone() {
      const newSelectedNotes = this.selectedNotes.map(i => false);
      this.selectedNotes = newSelectedNotes;
      this.emitChange();
    },
    onApplyScale(scaleDegrees, clearOnApply) {
      const newSelectedNotes = this.selectedNotes.map(i => clearOnApply ? false : i);
      scaleDegrees.forEach(idx => {
        newSelectedNotes[idx] = true;
      });
      this.selectedNotes = newSelectedNotes;
      this.emitChange();
    },
    rotateSelected() {
      const [first, ...rest] = this.selectedNotes;
      this.selectedNotes = [...rest, first];
      this.emitChange();
    }
  }
}
</script>
