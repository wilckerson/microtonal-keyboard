<template>
  <div>
    <button @click="selectAll">Select All</button>
    <button @click="selectNone">Select None</button>

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
export default {
  props: {
    noteTexts: Array,
    noteNames: Array,
    defaultChecked: Boolean,
    initialSelectedNotesIdx: Array,
  },
  data() {
    return {
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
  },
  methods: {
    onChangeSelectedNote() {
      this.emitChange();
    },
    populateNotes() {
      if (this.initialSelectedNotesIdx) {
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
      this.$emit('change', this.selectedNotes, -1);
    },
    selectNone() {
      const newSelectedNotes = this.selectedNotes.map(i => false);
      this.selectedNotes = newSelectedNotes;
      this.$emit('change', this.selectedNotes, -1);
    },
  }
}
</script>