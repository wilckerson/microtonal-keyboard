<template>
  <div class="tritriadic-container">
    <div class="header-section">
      <h2>🔺 Tritriadic Scale Generator</h2>
      <p class="subtitle">
        Generate a 7-note just intonation scale from a chain of three T:M:D triads
        (Subdominant, Tonic, Dominant) separated by the D/T interval and octave-reduced.
      </p>
    </div>

    <!-- Configuration Panel -->
    <div class="card config-card">
      <div class="config-row">
        <div class="input-group">
          <label for="input-t"><strong>T</strong> (Tonic)</label>
          <input
            id="input-t"
            type="number"
            min="1"
            max="1000"
            v-model.number="tVal"
            @input="validateInputs"
          />
        </div>

        <div class="input-group">
          <label for="input-m"><strong>M</strong> (Mediant)</label>
          <input
            id="input-m"
            type="number"
            min="1"
            max="1000"
            v-model.number="mVal"
            @input="validateInputs"
          />
        </div>

        <div class="input-group">
          <label for="input-d"><strong>D</strong> (Dominant)</label>
          <input
            id="input-d"
            type="number"
            min="1"
            max="1000"
            v-model.number="dVal"
            @input="validateInputs"
          />
        </div>

        <div class="input-group">
          <label for="input-base-freq">Base Freq (Hz)</label>
          <input
            id="input-base-freq"
            type="number"
            step="0.01"
            min="20"
            max="2000"
            v-model.number="baseFreq"
          />
        </div>

        <div class="input-group preset-group">
          <label for="select-preset">Presets</label>
          <select id="select-preset" v-model="selectedPreset" @change="applyPreset">
            <option v-for="p in presetList" :key="p.value" :value="p.value">
              {{ p.label }}
            </option>
          </select>
        </div>

        <div class="input-group unit-group">
          <label for="select-display-unit">Display Unit</label>
          <select id="select-display-unit" v-model="displayUnit">
            <option value="fractions">Fractions (e.g. 9/8)</option>
            <option value="cents">Cents (e.g. 204¢)</option>
            <option value="ratios">Decimal Ratios (e.g. 1.125)</option>
            <option value="frequency">Frequency (Hz)</option>
          </select>
        </div>

        <div class="input-group sample-group" v-if="audioSampleList.length > 0">
          <label for="select-sound">Instrument</label>
          <select id="select-sound" v-model="currentSoundSample" @change="onSoundSampleChange">
            <option v-for="(sample, idx) in audioSampleList" :key="idx" :value="sample">
              {{ getSampleName(sample) }}
            </option>
          </select>
        </div>
      </div>

      <div class="options-row">
        <label class="checkbox-label">
          <input type="checkbox" v-model="includeOctave" /> Include Octave (2/1)
        </label>
        <span class="ratio-summary">
          Triad: <strong>{{ tVal }}:{{ mVal }}:{{ dVal }}</strong> &nbsp;|&nbsp;
          Dominant step: <strong>{{ dominantStepFraction.n }}/{{ dominantStepFraction.d }}</strong>
          ({{ dominantStepCents.toFixed(1) }}¢)
        </span>
      </div>
    </div>

    <!-- Triads Overview Cards -->
    <div class="chords-grid">
      <div class="chord-card subdominant-card">
        <div class="chord-header">
          <span class="badge marker-subdominant"></span>
          <h4>Subdominant Triad (× T/D)</h4>
        </div>
        <div class="chord-notes">
          <div v-for="(n, idx) in subdominantNotes" :key="idx" class="chord-note-pill">
            <span class="note-fraction">{{ formatNoteValue(n) }}</span>
            <small>{{ formatNoteSecondary(n) }}</small>
          </div>
        </div>
        <button class="btn btn-sm btn-subdominant" @click="playChord(subdominantNotes)">
          🔊 Play Subdominant
        </button>
      </div>

      <div class="chord-card tonic-card">
        <div class="chord-header">
          <span class="badge marker-tonic"></span>
          <h4>Tonic Triad (Root)</h4>
        </div>
        <div class="chord-notes">
          <div v-for="(n, idx) in tonicNotes" :key="idx" class="chord-note-pill">
            <span class="note-fraction">{{ formatNoteValue(n) }}</span>
            <small>{{ formatNoteSecondary(n) }}</small>
          </div>
        </div>
        <button class="btn btn-sm btn-tonic" @click="playChord(tonicNotes)">
          🔊 Play Tonic
        </button>
      </div>

      <div class="chord-card dominant-card">
        <div class="chord-header">
          <span class="badge marker-dominant"></span>
          <h4>Dominant Triad (× D/T)</h4>
        </div>
        <div class="chord-notes">
          <div v-for="(n, idx) in dominantNotes" :key="idx" class="chord-note-pill">
            <span class="note-fraction">{{ formatNoteValue(n) }}</span>
            <small>{{ formatNoteSecondary(n) }}</small>
          </div>
        </div>
        <button class="btn btn-sm btn-dominant" @click="playChord(dominantNotes)">
          🔊 Play Dominant
        </button>
      </div>
    </div>

    <!-- Interactive Scale Keyboard -->
    <div class="card keyboard-card">
      <div class="keyboard-header">
        <h3>Interactive Keyboard ({{ scaleNotesCount }} notes)</h3>
        <div class="legend">
          <span class="legend-item"><span class="badge marker-subdominant"></span> Subdominant</span>
          <span class="legend-item"><span class="badge marker-tonic"></span> Tonic</span>
          <span class="legend-item"><span class="badge marker-dominant"></span> Dominant</span>
        </div>
      </div>

      <!-- Arpeggiator Controls -->
      <div class="arpeggiator-bar">
        <div class="arp-control-group">
          <label for="select-arp-pattern"><strong>Pattern:</strong></label>
          <select id="select-arp-pattern" v-model="selectedArpPattern">
            <option value="up">▲ Up (Ascending)</option>
            <option value="down">▼ Down (Descending)</option>
            <option value="up-down">▲▼ Up & Down (Triangle)</option>
            <option value="down-up">▼▲ Down & Up</option>
            <option value="thirds">↷ Thirds (1-3-2-4...)</option>
            <option value="converge">⇥ Converging (1-8-2-7...)</option>
            <option value="alberti">🎹 Alberti Bass (Mozart 1-5-3-5)</option>
            <option value="moroder">🪩 Moroder Bounce ("I Feel Love")</option>
            <option value="bach">🎼 Bach Prelude (BWV 846 Broken Chord)</option>
            <option value="glass">🌊 Philip Glass (Minimalist Pulse)</option>
            <option value="ode-to-joy">🎶 Ode to Joy / Ode à Alegria (Beethoven)</option>
            <option value="triad-chain">🔺 Triad Chain (Subdom → Tonic → Dom)</option>
            <option value="random">🔀 Random Walk</option>
          </select>
        </div>

        <div class="arp-control-group">
          <label for="input-arp-speed"><strong>Speed:</strong> {{ arpSpeedMs }}ms</label>
          <input
            id="input-arp-speed"
            type="range"
            min="70"
            max="500"
            step="10"
            v-model.number="arpSpeedMs"
            class="arp-speed-slider"
          />
        </div>

        <div class="arp-control-group arp-loop-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="isLoopingArp" /> 🔁 Loop
          </label>
        </div>

        <button
          :class="['btn', 'btn-sm', isArpeggiating ? 'btn-stop' : 'btn-action']"
          @click="toggleArpeggiator"
        >
          {{ isArpeggiating ? "⏹ Stop Arp" : "▶ Play Arpeggio" }}
        </button>
      </div>

      <div class="audio-keys-strip">
        <div
          v-for="(note, idx) in scaleDegrees"
          :key="tVal + '_' + mVal + '_' + dVal + '_' + selectedModeIndex + '_' + idx"
          class="audio-key-wrapper"
        >
          <div class="degree-label">#{{ idx + 1 }}</div>
          <audio-key
            ref="audioKeys"
            :keyName="keyShortcuts[idx] || ''"
            :idx="String(idx + 1)"
            :freq="note.frequency"
            :text="formatNoteValue(note)"
            :color="getNoteColor(note)"
            :markers="note.markers"
            @onChangeActive="onChangeActiveNote(note, $event)"
          />
          <div class="cents-subtext">{{ formatNoteSecondary(note) }}</div>
        </div>
      </div>

      <div v-if="activeNoteInfo" class="active-note-banner">
        <strong>Active Note:</strong>
        {{ activeNoteInfo.fraction.n }}/{{ activeNoteInfo.fraction.d }}
        ({{ activeNoteInfo.decimal.toFixed(5) }}) &bull;
        {{ activeNoteInfo.cents.toFixed(1) }}¢ &bull;
        {{ activeNoteInfo.frequency.toFixed(2) }} Hz &bull;
        Roles: {{ activeNoteInfo.roles.join(", ") }}
      </div>
    </div>

    <!-- Rotation Modes Card -->
    <div class="card table-card">
      <div class="table-header">
        <div>
          <h3 style="display: inline-block; margin-right: 12px;">🔄 Rotation Modes</h3>
          <span class="active-mode-badge">
            Active: Mode {{ selectedModeIndex + 1 }}
            ({{ (rotationModes[selectedModeIndex] && rotationModes[selectedModeIndex].rootFraction) ? rotationModes[selectedModeIndex].rootFraction.n + '/' + rotationModes[selectedModeIndex].rootFraction.d : '1/1' }})
          </span>
        </div>
        <div class="header-actions">
          <button
            v-if="selectedModeIndex !== 0"
            class="btn btn-sm btn-outline"
            style="margin-right: 8px;"
            @click="selectMode(0)"
          >
            Reset to Mode 1 (Root)
          </button>
          <button class="btn btn-sm btn-outline" @click="showScalaModal = !showScalaModal">
            {{ showScalaModal ? "Hide Scala (.scl)" : "Export Scala (.scl)" }}
          </button>
        </div>
      </div>

      <div v-if="showScalaModal" class="scala-container">
        <label><strong>Scala Scale File (.scl) for Active Mode {{ selectedModeIndex + 1 }}:</strong></label>
        <textarea readonly :value="scalaFileContent" rows="10" class="scala-textarea"></textarea>
        <button class="btn btn-sm btn-action" @click="copyScala">Copy to Clipboard</button>
        <span v-if="copied" class="copied-indicator">✔ Copied!</span>
      </div>

      <div class="rotation-table-wrapper">
        <table class="rotation-data-table">
          <thead>
            <tr>
              <th style="width: 80px;">Action</th>
              <th style="width: 85px;">Mode</th>
              <th style="width: 70px;">Root</th>
              <th v-for="(note, cidx) in (rotationModes[0] ? rotationModes[0].notes : [])" :key="'col_' + cidx">
                {{ cidx === 0 ? '1' : (cidx === rotationModes[0].notes.length - 1 ? 'Period' : '#' + (cidx + 1)) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(mode, ridx) in rotationModes"
              :key="'mode_row_' + ridx"
              :class="{ 'active-mode-row': selectedModeIndex === ridx }"
            >
              <td>
                <button
                  :class="['btn', 'btn-xs', selectedModeIndex === ridx ? 'btn-mode-active' : 'btn-mode-select']"
                  @click="selectMode(ridx)"
                >
                  {{ selectedModeIndex === ridx ? "✓ Active" : "Select" }}
                </button>
              </td>
              <td>
                <strong>{{ mode.name }}</strong>
              </td>
              <td>
                <code>{{ mode.rootFraction.n }}/{{ mode.rootFraction.d }}</code>
              </td>
              <td
                v-for="(note, cidx) in mode.notes"
                :key="'mode_' + ridx + '_' + cidx"
                class="mode-note-cell"
              >
                <div class="mode-fraction">{{ formatNoteValue(note) }}</div>
                <small class="mode-cents">{{ formatNoteSecondary(note) }}</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Unique Notes Section (similar to LambdomaKeyboard) -->
      <div class="unique-notes-section">
        <div class="unique-notes-header">
          <h4>Unique Notes ({{ uniqueNotesCount }})</h4>
          <div class="unique-notes-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="uniqueNotesScopeAll" />
              All Modes ({{ allModesUniqueNotesCount }}) vs Active Mode ({{ scaleNotesCount }})
            </label>
          </div>
        </div>

        <p class="notes-count-label">
          <strong>Notes per octave:</strong> {{ uniqueNotesCount }}
        </p>

        <div class="unique-notes-chips">
          <span
            v-for="(n, idx) in uniqueModeNotes"
            :key="'uniq_' + idx"
            class="unique-note-chip"
            :title="n.fraction.n + '/' + n.fraction.d + ' (' + n.cents.toFixed(1) + '¢, ' + n.decimal.toFixed(4) + ')'"
          >
            <strong class="chip-idx">{{ idx + 1 }}.</strong>
            <span class="chip-value">{{ formatNoteValue(n) }}</span>
            <small class="chip-sub">{{ formatNoteSecondary(n) }}</small>
          </span>
        </div>

        <div class="raw-notes-list">
          <code>{{ uniqueModeNotesFormattedList }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AudioKey from "./AudioKey.vue";
import { ratioToCents } from "./core/core.js";
import {
  simplifyFraction,
  getTritriadicChords,
  generateTritriadicScale,
  computeTritriadicModes
} from "./core/tritriadic.js";

export default {
  name: "Tritriadic",
  components: {
    AudioKey
  },
  data() {
    return {
      tVal: 6,
      mVal: 7,
      dVal: 9,
      baseFreq: 261.63,
      selectedPreset: "6:7:9",
      presetList: [
        { label: "1:3:5", value: "1:3:5" },
        { label: "3:5:7", value: "3:5:7" },
        { label: "3:7:5", value: "3:7:5" },
        { label: "5:7:3", value: "5:7:3" },
        { label: "4:5:6 (Ptolemy / Just Major)", value: "4:5:6" },
        { label: "6:7:8", value: "6:7:8" },
        { label: "6:8:7", value: "6:8:7" },
        { label: "8:7:6", value: "8:7:6" },
        { label: "6:7:9 (Chalmers Tritriad69)", value: "6:7:9" },
        { label: "7:9:11", value: "7:9:11" },
        { label: "9:11:13", value: "9:11:13" },
        { label: "13:11:9", value: "13:11:9" },
        { label: "10:12:15 (Just Minor)", value: "10:12:15" },
        { label: "10:13:15 (Barbados)", value: "10:13:15" },
        { label: "10:14:15", value: "10:14:15" },
        { label: "11:13:15", value: "11:13:15" },
        { label: "14:18:21 (Superpyth)", value: "14:18:21" },
        { label: "18:22:27 (Neutral)", value: "18:22:27" },
        { label: "22:27:33 (Neutral 2)", value: "22:27:33" },
        { label: "26:30:39", value: "26:30:39" },
        { label: "26:32:39", value: "26:32:39" }
      ],
      includeOctave: true,
      selectedModeIndex: 0,
      uniqueNotesScopeAll: true,
      displayUnit: "fractions",
      keyShortcuts: ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      activeNoteInfo: null,
      showScalaModal: false,
      copied: false,
      selectedArpPattern: "up",
      arpSpeedMs: 200,
      isLoopingArp: false,
      isArpeggiating: false,
      arpTimers: [],
      audioSampleList: window.audioSamples || [
        "./audio-samples/guitar-note_G.wav",
        "./audio-samples/sine.wav",
        "./audio-samples/flute.wav",
        "./audio-samples/piano-a_A_major.wav"
      ],
      currentSoundSample:
        window.selectedAudioSample || "./audio-samples/guitar-note_G.wav"
    };
  },
  created() {
    if (!window.selectedAudioSample) {
      window.selectedAudioSample = this.currentSoundSample;
    }
  },
  computed: {
    dominantStepFraction() {
      return simplifyFraction(this.dVal, this.tVal);
    },
    dominantStepCents() {
      return ratioToCents(this.dVal / this.tVal);
    },
    rawChordsData() {
      return getTritriadicChords(this.tVal, this.mVal, this.dVal);
    },
    subdominantNotes() {
      return this.rawChordsData.subdominant;
    },
    tonicNotes() {
      return this.rawChordsData.tonic;
    },
    dominantNotes() {
      return this.rawChordsData.dominant;
    },
    baseScaleDegrees() {
      return generateTritriadicScale(this.tVal, this.mVal, this.dVal, {
        includeOctave: this.includeOctave,
        baseFreq: this.baseFreq
      });
    },
    rotationModes() {
      return computeTritriadicModes(this.baseScaleDegrees, this.baseFreq);
    },
    scaleDegrees() {
      if (
        this.selectedModeIndex > 0 &&
        this.rotationModes[this.selectedModeIndex]
      ) {
        return this.rotationModes[this.selectedModeIndex].notes;
      }
      return this.baseScaleDegrees;
    },
    scalaFileContent() {
      const scaleLines = this.scaleDegrees
        .filter((n) => Math.abs(n.decimal - 1.0) > 1e-6)
        .map((n) => `${n.fraction.n}/${n.fraction.d}`);

      return [
        `! tritriadic_${this.tVal}_${this.mVal}_${this.dVal}.scl`,
        `!`,
        `Tritriadic ${this.tVal}:${this.mVal}:${this.dVal} Scale`,
        ` ${scaleLines.length}`,
        `!`,
        ...scaleLines,
        ""
      ].join("\n");
    },
    scaleNotesCount() {
      if (!this.scaleDegrees || this.scaleDegrees.length <= 1) return 0;
      const filtered = this.scaleDegrees.filter(
        (n) => Math.abs(n.decimal - 2.0) > 1e-6
      );
      if (filtered.length < this.scaleDegrees.length) {
        return filtered.length;
      }
      return this.scaleDegrees.length - 1;
    },
    allModesUniqueNotes() {
      const all = [];
      this.rotationModes.forEach((mode) => {
        mode.notes.forEach((n) => all.push(n));
      });

      const map = new Map();
      all.forEach((n) => {
        if (Math.abs(n.decimal - 2.0) < 1e-6) return;
        const key = n.decimal.toFixed(8);
        if (!map.has(key)) {
          map.set(key, n);
        }
      });

      return Array.from(map.values()).sort(
        (a, b) => a.decimal - b.decimal
      );
    },
    uniqueModeNotes() {
      if (this.uniqueNotesScopeAll) {
        return this.allModesUniqueNotes;
      }
      if (!this.scaleDegrees || this.scaleDegrees.length <= 1) {
        return this.scaleDegrees;
      }
      const filtered = this.scaleDegrees.filter(
        (n) => Math.abs(n.decimal - 2.0) > 1e-6
      );
      if (filtered.length < this.scaleDegrees.length) {
        return filtered;
      }
      return this.scaleDegrees.slice(0, this.scaleDegrees.length - 1);
    },
    uniqueNotesCount() {
      return this.uniqueModeNotes.length;
    },
    allModesUniqueNotesCount() {
      return this.allModesUniqueNotes.length;
    },
    uniqueModeNotesFormattedList() {
      return (
        "[ " +
        this.uniqueModeNotes
          .map((n) => this.formatNoteValue(n))
          .join(", ") +
        " ]"
      );
    }
  },
  methods: {
    validateInputs() {
      if (this.tVal < 1) this.tVal = 1;
      if (this.mVal < 1) this.mVal = 1;
      if (this.dVal < 1) this.dVal = 1;
      this.selectedModeIndex = 0;
    },
    applyPreset() {
      const parts = this.selectedPreset.split(":").map(Number);
      if (parts.length === 3) {
        this.tVal = parts[0];
        this.mVal = parts[1];
        this.dVal = parts[2];
        this.selectedModeIndex = 0;
      }
    },
    selectMode(modeIndex) {
      this.selectedModeIndex = modeIndex;
    },
    onSoundSampleChange() {
      window.selectedAudioSample = this.currentSoundSample;
      // Invalidate audioCache if existing
      if (window.audioCache) {
        delete window.audioCache;
      }
    },
    getSampleName(samplePath) {
      if (!samplePath) return "";
      const parts = samplePath.split("/");
      return parts[parts.length - 1].replace(/\.[^/.]+$/, "");
    },
    formatNoteValue(note, unit = this.displayUnit) {
      if (!note) return "";
      switch (unit) {
        case "cents":
          return note.cents.toFixed(1) + "¢";
        case "ratios":
          return note.decimal.toFixed(4);
        case "frequency":
          return note.frequency.toFixed(1) + "Hz";
        case "fractions":
        default:
          if (note.fraction && note.fraction.n) {
            return note.fraction.n + "/" + note.fraction.d;
          }
          return note.decimal.toFixed(4);
      }
    },
    formatNoteSecondary(note, unit = this.displayUnit) {
      if (!note) return "";
      if (unit === "fractions") {
        return note.cents.toFixed(0) + "¢";
      } else if (unit === "cents") {
        return note.fraction && note.fraction.n
          ? note.fraction.n + "/" + note.fraction.d
          : note.decimal.toFixed(4);
      } else if (unit === "ratios") {
        return note.fraction && note.fraction.n
          ? note.fraction.n + "/" + note.fraction.d
          : note.cents.toFixed(0) + "¢";
      } else if (unit === "frequency") {
        return note.fraction && note.fraction.n
          ? note.fraction.n + "/" + note.fraction.d
          : note.cents.toFixed(0) + "¢";
      }
      return "";
    },
    getNoteColor(note) {
      if (note.roles.length > 1) {
        return "#e0f7fa"; // Multirole key
      }
      if (note.roles.includes("Subdominant")) return "#e8f5e9";
      if (note.roles.includes("Tonic")) return "#e3f2fd";
      if (note.roles.includes("Dominant")) return "#fff3e0";
      return "#ffffff";
    },
    onChangeActiveNote(note, active) {
      if (active) {
        this.activeNoteInfo = note;
      }
    },
    getKeyComponentByFreq(freq) {
      if (!this.$refs.audioKeys) return null;
      return this.$refs.audioKeys.find(
        (k) => Math.abs(k.freq - freq) < 0.05
      );
    },
    playChord(chordNotes) {
      if (!this.$refs.audioKeys) return;
      chordNotes.forEach((cNote) => {
        const targetFreq = (this.baseFreq || 261.63) * cNote.decimal;
        const keyComp = this.getKeyComponentByFreq(targetFreq);
        if (keyComp) {
          keyComp.playSoundNote();
          keyComp.active = true;
          const t = setTimeout(() => {
            keyComp.stopSoundNote();
            keyComp.active = false;
          }, 1200);
          this.arpTimers.push(t);
        }
      });
    },
    getArpSequenceIndices() {
      const n = this.scaleDegrees.length;
      if (n === 0) return [];
      const indices = [];

      switch (this.selectedArpPattern) {
        case "up":
          for (let i = 0; i < n; i++) indices.push(i);
          break;
        case "down":
          for (let i = n - 1; i >= 0; i--) indices.push(i);
          break;
        case "up-down":
          for (let i = 0; i < n; i++) indices.push(i);
          for (let i = n - 2; i > 0; i--) indices.push(i);
          break;
        case "down-up":
          for (let i = n - 1; i >= 0; i--) indices.push(i);
          for (let i = 1; i < n - 1; i++) indices.push(i);
          break;
        case "thirds":
          for (let i = 0; i < n; i++) {
            indices.push(i);
            if (i + 2 < n) {
              indices.push(i + 2);
            }
          }
          break;
        case "converge": {
          let left = 0;
          let right = n - 1;
          while (left <= right) {
            indices.push(left);
            if (left !== right) indices.push(right);
            left++;
            right--;
          }
          break;
        }
        case "alberti": {
          // Classical Alberti Bass: Lowest - Highest - Middle - Highest
          const fifthOffset = 4;
          const thirdOffset = 2;
          for (let i = 0; i <= n - 3; i++) {
            const low = i;
            const high = Math.min(n - 1, i + fifthOffset);
            const mid = Math.min(n - 1, i + thirdOffset);
            indices.push(low, high, mid, high);
          }
          break;
        }
        case "moroder": {
          // Giorgio Moroder / Donna Summer "I Feel Love" synth octave bounce
          const top = n - 1;
          for (let i = 0; i < top; i++) {
            indices.push(i, top, i, top);
          }
          break;
        }
        case "bach": {
          // J.S. Bach Prelude No. 1 in C Major (BWV 846) broken chord pattern
          const top = n - 1;
          for (let i = 0; i < top; i++) {
            const root = i;
            const third = (i + 2) % top;
            const fifth = (i + 4) % top;
            indices.push(root, third, fifth, top, fifth, top);
          }
          break;
        }
        case "glass": {
          // Philip Glass Minimalist pulse: rotating 4-step harmonic cell
          for (let i = 0; i < n - 1; i++) {
            indices.push(i, (i + 1) % n, (i + 2) % n, (i + 1) % n);
          }
          break;
        }
        case "ode-to-joy": {
          // Beethoven: Ode to Joy (Ode an die Freude / Ode à Alegria) initial theme
          // Phrase 1 (half cadence): E E F G G F E D C C D E E D D
          // Phrase 2 (full cadence): E E F G G F E D C C D E D C C
          const odeDegrees = [
            2, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 2, 1, 1,
            2, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 1, 0, 0
          ];
          indices.push(...odeDegrees.map((deg) => Math.min(n - 1, deg)));
          break;
        }
        case "triad-chain": {
          const findIdx = (cNote) =>
            this.scaleDegrees.findIndex(
              (s) => Math.abs(s.decimal - cNote.decimal) < 1e-6
            );
          // Subdominant triad notes
          this.subdominantNotes.forEach((cn) => {
            const idx = findIdx(cn);
            if (idx !== -1) indices.push(idx);
          });
          // Tonic triad notes
          this.tonicNotes.forEach((cn) => {
            const idx = findIdx(cn);
            if (idx !== -1) indices.push(idx);
          });
          // Dominant triad notes
          this.dominantNotes.forEach((cn) => {
            const idx = findIdx(cn);
            if (idx !== -1) indices.push(idx);
          });
          break;
        }
        case "random": {
          const arr = [];
          for (let i = 0; i < n; i++) arr.push(i);
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
          }
          indices.push(...arr);
          break;
        }
        default:
          for (let i = 0; i < n; i++) indices.push(i);
      }
      return indices;
    },
    stopArpeggiator() {
      this.isArpeggiating = false;
      this.arpTimers.forEach((timer) => clearTimeout(timer));
      this.arpTimers = [];
      if (this.$refs.audioKeys) {
        this.$refs.audioKeys.forEach((keyComp) => {
          keyComp.stopSoundNote();
          keyComp.active = false;
        });
      }
    },
    toggleArpeggiator() {
      if (this.isArpeggiating) {
        this.stopArpeggiator();
      } else {
        this.playArpeggiator();
      }
    },
    playArpeggiator() {
      if (!this.$refs.audioKeys) return;
      this.stopArpeggiator();
      this.isArpeggiating = true;

      let currentStep = 0;

      const playNextStep = () => {
        if (!this.isArpeggiating) return;

        const sequence = this.getArpSequenceIndices();
        if (sequence.length === 0) {
          this.isArpeggiating = false;
          return;
        }

        if (currentStep >= sequence.length) {
          if (this.isLoopingArp) {
            currentStep = 0;
          } else {
            this.isArpeggiating = false;
            return;
          }
        }

        const noteIdx = sequence[currentStep];
        const targetNote = this.scaleDegrees[noteIdx];
        const stepTime = Math.max(50, Number(this.arpSpeedMs) || 200);
        const noteDuration = Math.round(stepTime * 0.85);

        if (targetNote) {
          const keyComp = this.getKeyComponentByFreq(targetNote.frequency);
          if (keyComp) {
            keyComp.playSoundNote();
            keyComp.active = true;

            const tStop = setTimeout(() => {
              keyComp.stopSoundNote();
              keyComp.active = false;
            }, noteDuration);
            this.arpTimers.push(tStop);
          }
        }

        currentStep++;
        const tNext = setTimeout(playNextStep, stepTime);
        this.arpTimers.push(tNext);
      };

      playNextStep();
    },
    copyScala() {
      navigator.clipboard.writeText(this.scalaFileContent).then(() => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      });
    }
  },
  beforeDestroy() {
    this.stopArpeggiator();
  }
};
</script>

<style scoped>
.tritriadic-container {
  max-width: 1040px;
  margin: 0 auto;
  padding: 16px 20px 40px;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  color: #2c3e50;
}

.header-section {
  text-align: center;
  margin-bottom: 20px;
}

.header-section h2 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
  max-width: 680px;
  margin: 0 auto;
  line-height: 1.5;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Config Row */
.config-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.input-group {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}

.input-group label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #475569;
}

.input-group input,
.input-group select {
  padding: 7px 10px;
  font-size: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: #f8fafc;
  outline: none;
  transition: border-color 0.15s;
}

.input-group input:focus,
.input-group select:focus {
  border-color: #3b82f6;
  background-color: #ffffff;
}

.preset-group {
  min-width: 210px;
}

.unit-group {
  min-width: 175px;
}

.sample-group {
  min-width: 150px;
}

.options-row {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #475569;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.checkbox-label {
  cursor: pointer;
  user-select: none;
}

.ratio-summary {
  color: #334155;
}

/* Chords Grid */
.chords-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.chord-card {
  border-radius: 8px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.subdominant-card {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.tonic-card {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.dominant-card {
  background: #fffbeb;
  border-color: #fde68a;
}

.chord-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.chord-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.badge {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.marker-subdominant {
  background-color: #4caf50;
}

.marker-tonic {
  background-color: #2196f3;
}

.marker-dominant {
  background-color: #ff9800;
}

.chord-notes {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.chord-note-pill {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.note-fraction {
  font-weight: 700;
  font-size: 14px;
  color: #0f172a;
}

.chord-note-pill small {
  font-size: 11px;
  color: #64748b;
}

/* Keyboard Card */
.keyboard-card {
  padding-bottom: 20px;
}

.keyboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.keyboard-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.legend {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: #475569;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.audio-keys-strip {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 6px;
  padding: 6px 2px 10px;
}

.audio-key-wrapper {
  flex: 1;
  min-width: 65px;
  max-width: 115px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: center;
}

.degree-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 4px;
}

.cents-subtext {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}

.active-note-banner {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 13px;
  color: #1e293b;
}

/* Buttons */
.btn {
  border: none;
  border-radius: 6px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, background-color 0.15s;
}

.btn:hover {
  opacity: 0.9;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-subdominant {
  background-color: #22c55e;
  color: #ffffff;
}

.btn-tonic {
  background-color: #3b82f6;
  color: #ffffff;
}

.btn-dominant {
  background-color: #f97316;
  color: #ffffff;
}

.btn-action {
  background-color: #6366f1;
  color: #ffffff;
}

.btn-stop {
  background-color: #ef4444;
  color: #ffffff;
}

.btn-stop:hover {
  background-color: #dc2626;
}

/* Arpeggiator Bar */
.arpeggiator-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin-bottom: 14px;
}

.arp-control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #334155;
}

.arp-control-group select {
  padding: 5px 8px;
  font-size: 13px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background-color: #ffffff;
  outline: none;
}

.arp-speed-slider {
  width: 110px;
  cursor: pointer;
}

.btn-outline {
  background: transparent;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-outline:hover {
  background: #f8fafc;
}

/* Table Card */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

/* Rotation Modes Table */
.active-mode-badge {
  display: inline-block;
  padding: 3px 8px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
}

.rotation-table-wrapper {
  overflow-x: auto;
}

.rotation-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  border: 1px solid #e2e8f0;
}

.rotation-data-table th,
.rotation-data-table td {
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.rotation-data-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #475569;
}

.active-mode-row {
  background-color: #f0fdf4 !important;
  font-weight: 600;
}

.btn-xs {
  padding: 3px 8px;
  font-size: 11px;
}

.btn-mode-active {
  background-color: #16a34a;
  color: #ffffff;
  cursor: default;
}

.btn-mode-select {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.btn-mode-select:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.mode-note-cell {
  min-width: 55px;
}

.mode-fraction {
  font-weight: 600;
  color: #1e293b;
}

.mode-cents {
  font-size: 10px;
  color: #64748b;
}

/* Unique Notes Section */
.unique-notes-section {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
  text-align: left;
}

.unique-notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 6px;
}

.unique-notes-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.notes-count-label {
  margin: 4px 0 10px;
  font-size: 13px;
  color: #475569;
}

.unique-notes-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.unique-note-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 12px;
  color: #0f172a;
}

.chip-idx {
  color: #64748b;
  font-size: 11px;
}

.chip-value {
  font-weight: 600;
}

.chip-sub {
  color: #64748b;
  font-size: 10px;
}

.raw-notes-list {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 12px;
  color: #334155;
  overflow-x: auto;
  word-break: break-all;
}
</style>
