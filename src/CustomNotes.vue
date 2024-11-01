<template>
  <div>
    <label>Custom Notes:</label>
    <textarea @change="onChangeInput" rows="5"></textarea>
  </div>
</template>

<script>
import { extractCustomNotes } from "./core/custom-notes-extractor";
export default {
  methods: {
    onChangeInput(ev) {
      const text = ev.target.value;
      const result = extractCustomNotes(text);
      console.log(result);
      this.$emit("change", result.values, result.names);
    }
  }
};
</script>
