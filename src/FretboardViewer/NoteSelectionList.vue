<template>
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
    noteTexts: function () {
      this.populateNotes();
    },
  },
  methods: {
    onChangeSelectedNote() {
      const selectedNotesIdx = this.selectedNotes
        .map((isSelected, index) => isSelected ? index : null)
        .filter(value => value != null);

      this.$emit('change', this.selectedNotes, selectedNotesIdx);
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
    }
  }
}
</script>