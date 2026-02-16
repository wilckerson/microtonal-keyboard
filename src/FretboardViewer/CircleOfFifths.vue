<template>
  <div class="circle-of-fifths-container">
    <div class="circle-ring">
      <div
        v-for="(item, posIdx) in circlePositions"
        :key="'cof-' + item.chromaticIdx"
        class="circle-note"
        :style="getNoteStyle(posIdx)"
      >
        <div class="circle-note-inner" :style="getNoteInnerStyle(posIdx)">
          <label class="circle-note-label">
            <input
              type="checkbox"
              :checked="selectedNotes[item.chromaticIdx]"
              @change="onToggle(item.chromaticIdx)"
            />
            <span class="circle-note-text">{{ item.noteText }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    selectedNotes: Array,
    noteTexts: Array,
    noteNames: Array,
    edoIdx_Fifth: Number,
  },
  computed: {
    noteCount() {
      return this.noteTexts ? this.noteTexts.length : 0;
    },
    circlePositions() {
      if (!this.noteCount || !this.edoIdx_Fifth) return [];
      const positions = [];
      for (let i = 0; i < this.noteCount; i++) {
        const chromaticIdx = (i * this.edoIdx_Fifth) % this.noteCount;
        positions.push({
          chromaticIdx,
          noteText: this.noteNames && this.noteNames[chromaticIdx]
            ? this.noteNames[chromaticIdx]
            : (this.noteTexts[chromaticIdx] || ''),
        });
      }
      return positions;
    },
    radius() {
      // Half of the container size minus padding for labels
      return 160;
    },
  },
  methods: {
    getNoteStyle(posIdx) {
      const angle = (posIdx / this.noteCount) * 360 - 90; // start from top
      return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `rotate(${angle}deg) translateY(-${this.radius}px)`,
        width: '0',
        height: '0',
      };
    },
    getNoteInnerStyle(posIdx) {
      const angle = (posIdx / this.noteCount) * 360 - 90;
      return {
        transform: `rotate(${-angle}deg)`,
      };
    },
    onToggle(chromaticIndex) {
      this.$emit('toggle', chromaticIndex);
    },
  },
};
</script>

<style scoped>
.circle-of-fifths-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.circle-ring {
  position: relative;
  width: 332px;
  height: 332px;
  border: 2px solid #eee;
  border-radius: 50%;
  box-sizing: border-box;
}

.circle-note {
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle-note-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  margin-left: -24px;
  margin-top: -10px;
  text-align: center;
}

.circle-note-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  font-size: 11px;
  white-space: nowrap;
  user-select: none;
}

.circle-note-label input[type="checkbox"] {
  margin: 0 0 1px 0;
  cursor: pointer;
}

.circle-note-text {
  line-height: 1.1;
}
</style>
