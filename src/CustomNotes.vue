<template>
  <div>
    <label>Custom Notes:</label>
    <textarea @change="onChangeInput" rows="5"></textarea>
    <!-- <pre>{{customNotes}}</pre> -->
  </div>
</template>

<script>
export default {
  methods: {
    onChangeInput(ev) {
      const text = ev.target.value;
      const result = extractCustomNotes(text);
      this.$emit("change", result);
    }
  }
};

function extractCustomNotes(input) {
  var result = [];
  var lines = (input || "").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    var v = undefined;
    if (line.indexOf("/") !== -1) {
      //Ratio
      var parts = line.split("/");
      v = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else if (line.indexOf("\\") !== -1) {
      //Index of edo
      var parts = line.split("\\");
      v = Math.pow(2, parseFloat(parts[0]) / parseFloat(parts[1]));
    } else if (line.indexOf("c") !== -1) {
      //Cents
      var parts = line.split("c");
      var cent = parseFloat(parts[0]);
      v = Math.pow(2, cent / 1200);
    } else {
      v = parseFloat(line);
    }

    if (v !== undefined && !isNaN(v)) {
      result.push(v);
    }
  }

  return result.sort();
}
</script>
