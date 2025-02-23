<template>
  <div>
    <p v-if="!hasScales">Scales are not available for this tunning.</p>
    <div v-if="hasScales" class="scale-options">
      Scale root note:
      <select v-model="selectedRootNoteIdx">
        <option v-for="(noteText, idx) in noteTexts" :key="'root-note-selection-' + idx" :value="idx">
          {{ noteText }}
          {{ noteNames && noteNames[idx] }}
        </option>
      </select>
      <select v-model="selectedScaleIdx">
        <option v-for="(scale, idx) in scales" :key="'scale-selection-' + idx" :value="idx">{{ scale.name }}</option>
      </select>
      <button @click="onClickApplyScale">Apply scale</button>
    </div>
  </div>
</template>

<script>
import noteTemplates from "../core/note-templates";
export default {
  props: {
    noteTexts: Array,
    noteNames: Array,
    selectedTemplate: String,
  },
  data() {
    return {
      selectedScaleIdx: 0,
      selectedRootNoteIdx: 0,
    }
  },
  computed: {
    scales() {
      return (noteTemplates[this.selectedTemplate] && noteTemplates[this.selectedTemplate].scales) || [];
    },
    hasScales() {
      return this.scales.length > 0
    }
  },
  methods: {
    onClickApplyScale() {
      const scaleSize = this.noteTexts.length;
      const scaleDegrees = this.scales[this.selectedScaleIdx].degrees;
      const scaleDegreesFromRoot = scaleDegrees.map(i => (this.selectedRootNoteIdx + i) % scaleSize);
      this.$emit('onApplyScale', scaleDegreesFromRoot);
    }
  }
}
</script>


<style scoped>
.scale-options {
  margin: 12px 0;
}
</style>