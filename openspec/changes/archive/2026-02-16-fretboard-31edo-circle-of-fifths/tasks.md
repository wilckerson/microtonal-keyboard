## 1. Template Metadata

- [x] 1.1 Add `isEdo: true`, `edoIdx_Fifth: 18`, and `useCircleOfFifthViewer: true` to the `"31edo - Guitar - Standard Tuning"` template in `src/core/note-templates.js`
- [x] 1.2 Add `isEdo: true`, `edoIdx_Fifth: 18`, and `useCircleOfFifthViewer: true` to the `"31edo - Bass - Standard Tuning"` template in `src/core/note-templates.js`

## 2. CustomNotes Metadata Forwarding

- [x] 2.1 Update `CustomNotes.vue` to read `isEdo`, `edoIdx_Fifth`, and `useCircleOfFifthViewer` from the selected template object and include them in the `@change` event emission

## 3. Fretboard2 Integration

- [x] 3.1 Update `onChangeCustomNotes` in `Fretboard2.vue` to receive and store `isEdo`, `edoIdx_Fifth`, and `useCircleOfFifthViewer` in component data
- [x] 3.2 Add `showCircleOfFifths` boolean to `Fretboard2.vue` data for toggling the circle visibility
- [x] 3.3 Add a "Show Circle of Fifths" checkbox in the middle control panel template, conditionally rendered when `useCircleOfFifthViewer` is true
- [x] 3.4 Import and register `CircleOfFifths` component in `Fretboard2.vue`
- [x] 3.5 Render `CircleOfFifths` below the toggle checkbox, passing `subsetEnabled`, `noteTexts`, `noteNames`, and `edoIdx_Fifth` as props, and handling the `toggle` event

## 4. NoteSelectionList External State Support

- [x] 4.1 Add optional `externalSelectedNotes` prop to `NoteSelectionList.vue`
- [x] 4.2 Add a watcher on `externalSelectedNotes` that updates the internal `selectedNotes` array when the external prop changes
- [x] 4.3 Pass `subsetEnabled` as `externalSelectedNotes` from `Fretboard2.vue` to `NoteSelectionList`

## 5. CircleOfFifths Component

- [x] 5.1 Create `src/FretboardViewer/CircleOfFifths.vue` with props: `selectedNotes` (boolean array), `noteTexts` (array), `noteNames` (array), `edoIdx_Fifth` (number)
- [x] 5.2 Implement computed property that generates the circle-of-fifths order array from `edoIdx_Fifth` and `noteTexts.length` using `(i * edoIdx_Fifth) % noteCount`
- [x] 5.3 Build the template: a container div with circular border, and one element per note positioned radially using CSS transforms
- [x] 5.4 Each note element renders a checkbox bound to the corresponding chromatic index in `selectedNotes`, plus the note name label
- [x] 5.5 Emit `toggle(chromaticIndex)` event when a checkbox is clicked

## 6. Bidirectional Sync Wiring

- [x] 6.1 Implement `onCircleToggle(chromaticIndex)` handler in `Fretboard2.vue` that toggles the note in `subsetEnabled` and triggers reactivity
- [x] 6.2 Verify that toggling on the circle updates the flat NoteSelectionList checkboxes
- [x] 6.3 Verify that toggling on the flat list updates the CircleOfFifths checkboxes
- [x] 6.4 Verify that Select All / Select None / Rotate / Apply Scale all reflect on the circle

## 7. Circle Styling

- [x] 7.1 Style the circle container as a square with `border-radius: 50%` and visible border
- [x] 7.2 Position each note element using `transform: rotate(angle) translateY(-radius)` with counter-rotation on the label for upright text
- [x] 7.3 Use fixed-width containers for each note position to prevent layout jitter from varying accidental widths
- [x] 7.4 Set circle diameter to ~300px+ and verify no note labels overlap at 31 positions
