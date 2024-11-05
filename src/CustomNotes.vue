<template>
  <div>
    <label>Notes:
      <select v-model="selectedTemplate">
        <option v-for="noteTemplate in noteTemplateOptions" v-bind:key="noteTemplate" :value="noteTemplate">{{
          noteTemplate }}</option>
        <option value="">Custom</option>
      </select></label>
    <br />
    <textarea @change="onChangeInput" rows="13" v-model="inputText"></textarea>
  </div>
</template>

<script>
import { extractCustomNotes } from "./core/custom-notes-extractor";
import noteTemplates from "./core/note-templates";
export default {
  data() {
    return {
      selectedTemplate: "",
      noteTemplateOptions: [],
      inputText: ""
    }
  },
  mounted() {
    const options = Object.keys(noteTemplates);
    this.noteTemplateOptions = options;
    this.selectedTemplate = options[0];
  },
  watch: {
    selectedTemplate(value) {
      if (value) {
        const templateData = noteTemplates[value];
        this.inputText = templateData.notes.join("\n");
        this.onChangeInput({
          target: { value: this.inputText },
          keepSelectedTemplate: true,
          baseFreq: templateData.baseFreq,
          stringsTuningIdx: templateData.stringsTuningIdx
        });
      }
    }
  },
  methods: {
    onChangeInput(ev) {
      const text = ev.target.value;
      const result = extractCustomNotes(text);
      if (!ev.keepSelectedTemplate) {
        this.selectedTemplate = "";
      }
      this.$emit(
        "change",
        result.values,
        result.names,
        result.texts,
        ev.baseFreq,
        ev.stringsTuningIdx
      );
    }
  }
};
</script>
