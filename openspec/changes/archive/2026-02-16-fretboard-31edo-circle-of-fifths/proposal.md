## Why

The FretboardViewer's "Subset enabled notes" panel offers a flat checkbox list for toggling scale degrees on/off. For 31edo — a tuning system with 31 notes per octave — this list is long and doesn't reveal the harmonic relationships between notes. A circle-of-fifths visualization would let users see and select notes by their fifth-chain proximity, making it far more intuitive to build diatonic, chromatic, or extended meantone subsets — which is exactly how musicians think about 31edo's structure.

## What Changes

- Add a **Circle of Fifths selection mode** toggle that appears in the middle panel (below "Subset enabled notes") when the current custom notes are a 31edo set.
- Render all 31 notes arranged in a **circular layout** following the 31edo circle of fifths (each step = 18 steps of 31edo, the meantone fifth generator).
- Each note on the circle has a **checkbox** that is synchronized with the existing subset-enabled boolean array — clicking a note on the circle toggles the same note in the flat list, and vice versa.
- The circle is styled as a **proper geometric circle** with note labels and checkboxes positioned radially around it, similar to the [31edo CoF reference diagram](https://en.xen.wiki/images/thumb/9/97/31edo_CoF_semi_and_sesqui.png/500px-31edo_CoF_semi_and_sesqui.png).
- Add **EDO detection logic** to determine when the current note set is a 31-note EDO tuning (by parsing note text format or matching against known 31edo templates).

## Capabilities

### New Capabilities

- `circle-of-fifths-selector`: A circular visual note-selection widget for the FretboardViewer that arranges 31edo notes by their circle-of-fifths order, supports checkbox toggling synchronized with the existing subset list, and conditionally appears only for 31edo note sets.

### Modified Capabilities

_(none — this is purely additive; existing note selection behavior is unchanged)_

## Impact

- **Code**: New Vue component(s) within `src/FretboardViewer/`. Modifications to `Fretboard2.vue` to detect 31edo and conditionally render the circle selector. Minor changes to `NoteSelectionList.vue` or its parent to synchronize selection state bidirectionally.
- **Dependencies**: No new libraries — the circular layout uses CSS (transforms or absolute positioning) with existing Vue 2.6 capabilities.
- **Systems**: No backend, build, or test infrastructure changes required.
