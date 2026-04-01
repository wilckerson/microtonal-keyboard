# FretboardViewer — Module Summary

## Description

The FretboardViewer is a Vue 2 module that renders an interactive microtonal fretboard instrument. It allows users to explore custom tuning systems (EDO, JI ratios, etc.) on a virtual fretboard with configurable strings, tunings, display modes, note subsets, and playable audio keys. It is one of the main views of the microtonal-keyboard application.

---

## File Overview

| File | Role |
|---|---|
| `Index.vue` | Entry point — simply renders `Fretboard2` inside a wrapper with a heading. |
| `Fretboard.vue` | **Legacy/simple fretboard** — renders N `InstrumentString` components. Not actively used (replaced by `Fretboard2`). |
| `Fretboard2.vue` | **Main fretboard component** — full-featured fretboard with tuning, display modes, note selection, drag-to-play, note groups, and more. |
| `fretboard.js` | **Core business logic** — builds fretboard data (fret widths, frequencies, display text) from scale ratios and tuning parameters. |
| `fretboard.test.js` | Unit tests for `getRelativeRatioByIndex`, `getNoteNameByStringTuningIdx`, `buildFretboardData`, `buildFretboardDataByRatios`, `DISPLAY_MODES`, and all display mode logic. |
| `CircleOfFifths.vue` | Circular note selector arranged by fifths; only shown for EDO tunings that provide a fifth index. |
| `Fret.vue` | Minimal visual fret bar (2px black rectangle). Used by legacy `Fretboard.vue`. |
| `InstrumentString.vue` | A single string with N `Fret` components. Used by legacy `Fretboard.vue`. |
| `NoteGroup.vue` | CRUD UI for "highlight groups" — lets users create named groups of notes with a color, then overlay color markers on the fretboard. |
| `NoteSelectionList.vue` | Checkbox list of notes for enabling/disabling individual scale degrees (subset selection). Supports external state sync, skip-fretting, and scale template application. |
| `ScaleOptions.vue` | Dropdown UI to apply predefined scale patterns (e.g., Major, Minor) from `note-templates.js` onto the note selection. |

---

## Current Features

- **Configurable tuning systems** — Accepts custom note input (EDO, ratios, cents) via the `CustomNotes` component; supports templates like 12-EDO, 31-EDO, and custom JI scales.
- **String tuning modes** — Strings can be tuned by scale index offset or by explicit ratio. A cents mode is stubbed but not yet implemented.
- **Multiple display modes** — Default (note name/ratio), Ratio, Ratio reduced by period, Ratio relative to string, Cents, Cents reduced, Cents relative, Frequency (Hz), Frets distance (mm from nut).
- **Full frets toggle** — When enabled, all strings share the same fret positions (aligned to the base index), like a guitar. When off, each string has independently rotated fret positions.
- **Note subset selection** — Users can enable/disable individual scale degrees via a checkbox list. Supports Select All/None, Rotate (mode cycling), and applying predefined scale templates.
- **Circle of Fifths view** — Alternative circular note selector (only for EDO tunings that expose a fifth index). Toggled via radio buttons.
- **Note highlight groups** — CRUD for colored note groups that display marker dots on frets matching selected scale degrees.
- **Drag-to-play** — Mouse drag and touch drag across frets triggers audio playback via the `AudioKey` component.
- **Keyboard shortcuts** — Enabled frets are mapped to keyboard keys (rows 1-9, Q-O, A-L, Z-M) via `getKeyName()`.
- **Scroll/capo position** — `baseIndex` shifts the fretboard starting position.
- **Unique notes display** — Optional panel showing the deduplicated set of ratios across all strings.
- **Scale options** — Apply named scale patterns (Major, Minor, etc.) with a root-note offset and optional clear-on-apply.
- **Manual fret edit mode** — A toggleable mode that lets users click individual frets (per string × fret position) to force-enable or force-disable them, layered on top of the scale-degree-based subset selection. Overrides are stored in `manualFretOverrides` and integrated into the fret data via `applyDisabledState()` in `fretboard.js`, so all downstream consumers (unique notes display, keyboard shortcuts, etc.) automatically respect them. Visual indicators (green/red outlines) distinguish overridden frets. Overrides auto-clear on scale change.

---

## Key Code Details

### Data Flow

1. **`CustomNotes`** (external component) emits scale data → `Fretboard2.onChangeCustomNotes()` stores `scale`, `noteNames`, `noteTexts`, `baseFreq`, `stringsTuningIdx`, template metadata, and EDO flags.
2. **`fretboard.js`** functions compute the fretboard grid:
   - `buildFretboardData()` — index-based string tuning.
   - `buildFretboardDataByRatios()` — ratio-based string tuning.
   - Both call `buildFretsData()` → `buildFretData()` per fret.
3. **Fretboard rendering** — `fretboardData` (computed property) returns a 2D array `[string][fret]` of `{ text, freq, width, scaleIdx, disabled, overrideClass }`. Each cell is rendered as an `<audio-key>` wrapped in a `<div class="fret-wrapper">`.

### Important Functions in `fretboard.js`

| Function | Purpose |
|---|---|
| `buildFretboardData(baseFreq, scale, stringsTuningIdx, ...)` | Builds the full fretboard grid using index-based tuning. Returns `[string][fret]` array. |
| `buildFretboardDataByRatios(baseFreq, scale, stringsTuningRatios, ...)` | Same but uses explicit ratio tuning per string. |
| `buildFretsData(scale, baseFreq, relativeRatio, ...)` | Builds one string's fret array with display text, frequency, and percentage width. |
| `buildFretData(ratio, relativeRatio, baseFreq, width, ...)` | Computes a single fret cell (text by display mode, freq, width, scaleIdx). |
| `getRelativeRatioByIndex(scale, index)` | Converts a scale-degree index (positive or negative) into an absolute frequency ratio. Handles multi-octave wrapping. |
| `getNoteNameByStringTuningIdx(stringTuningIdx, noteNames)` | Resolves a note name for a given index offset, wrapping around the note name array. |
| `computeFretPercentageDistance(ratio, periodRatio)` | Converts a ratio to a percentage position within one period for fret width layout. |
| `getScaleIdx(index, scaleSize)` | Maps any integer index (positive/negative) to a 0-based scale-degree index. |
| `applyDisabledState(fretboardData, subsetEnabled, fullFrets, manualFretOverrides)` | Post-processing step that enriches each fret cell with `disabled` (boolean) and `overrideClass` (CSS class string) based on subset selection and manual overrides. |

### External Dependencies (from parent `src/`)

| Import | Source | Used For |
|---|---|---|
| `AudioKey` | `../AudioKey.vue` | Playable key component (renders each fret, handles audio playback via Web Audio or samples). |
| `CustomNotes` | `../CustomNotes.vue` | Input component for defining scale/tuning data; emits parsed notes, names, texts, and template metadata to `Fretboard2`. |
| `ToggleSwitch` | `../ToggleSwitch.vue` | Imported but currently unused (was for `normalizeDisplay`). |
| `core.js` | `../core/core.js` | Utility functions: `unique`, `getKeyName`, `rotateScale`, `getScalePeriod`, `normalizeRatio`, `ratioToCents`, `ratioToFretDistance`. |
| `note-templates.js` | `../core/note-templates.js` | Predefined tuning templates with note definitions and scale patterns (used by `ScaleOptions`). |

### Component Communication

- **Props down, events up** pattern (Vue 2 style).
- `NoteSelectionList` emits `change(selectedNotes[], selectedNotesIdx[])`.
- `CircleOfFifths` emits `toggle(chromaticIndex)`.
- `ScaleOptions` emits `onApplyScale(scaleDegrees[], clearOnApply)`.
- `NoteGroup` emits `change(groups[])`.
- `Fretboard2` manages `subsetEnabled[]`, `noteGroups[]`, and `manualFretOverrides{}` as the single source of truth for selection state.
- `NoteSelectionList` supports external state sync via `externalSelectedNotes` prop (watched).

### Touch/Drag-to-Play Implementation

- Global `mouseup`, `touchmove`, and `touchend` listeners are registered in `mounted()` and cleaned up in `beforeDestroy()`.
- Touch drag uses `document.elementFromPoint()` → `closest('.key')` → accesses `__vue__` instance directly (Vue 2 internal). This approach is **fragile** and would break in Vue 3 or with any component refactor.
- The `isDragging` boolean is passed as a prop to `AudioKey` to enable mouse-enter playback.

---

## Known TODOs (from source comments)

- [ ] Display mode "only frets" with no numbers or notes
- [ ] Display active interval between two notes
- [x] Dropdown to change strings tuning input mode (index, customNoteInput)
- [x] Input number to control the base index position (like capo) 
- [ ] Display number of common frets between strings
- [x] Fix play bug on touch
- [ ] Strings count input
- [ ] Fix note frequency according to physical tuner
- [ ] Support navigate key mappings on active notes
- [ ] URL data similar to ScaleWorkshop

---

## Notes for Future Development

- **Vue 2 only** — Uses Options API, `beforeDestroy` lifecycle hook, and `__vue__` instance access. Migration to Vue 3 will require updating lifecycle hooks (`beforeUnmount`), removing `__vue__` reliance, and potentially switching to Composition API.
- **Cents tuning mode is stubbed** — `stringTuningMode === 'cents'` returns an empty array; the UI option is commented out.
- **`Fretboard.vue` is legacy** — `Index.vue` only uses `Fretboard2.vue`. The old `Fretboard.vue`, `Fret.vue`, and `InstrumentString.vue` could be removed if confirmed unused elsewhere.
- **No state persistence** — The "URL data similar to ScaleWorkshop" TODO suggests intent to support URL-based state sharing, but nothing is implemented.
- **`ToggleSwitch` is imported but unused** in `Fretboard2.vue` (the `normalizeDisplay` data property is commented out).
