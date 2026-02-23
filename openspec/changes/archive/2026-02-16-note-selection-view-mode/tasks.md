## 1. Add view-mode state to Fretboard2

- [x] 1.1 Add `noteSelectionViewMode` data property (default `"list"`) to Fretboard2.vue
- [x] 1.2 Remove `showCircleOfFifths` data property from Fretboard2.vue

## 2. Add view-mode selector UI

- [x] 2.1 Add radio buttons ("List" / "Circle of Fifths") inside the "Subset enabled notes" `<div>`, visible only when `useCircleOfFifthViewer` is true
- [x] 2.2 Bind radio buttons to `noteSelectionViewMode` with `v-model`

## 3. Restructure component visibility

- [x] 3.1 Change `NoteSelectionList` from always-visible to `v-show="noteSelectionViewMode === 'list'"` within the "Subset enabled notes" section
- [x] 3.2 Move `CircleOfFifths` into the "Subset enabled notes" section with `v-show="noteSelectionViewMode === 'circle'"` (keep existing props and event bindings)
- [x] 3.3 Remove the standalone "Show Circle of Fifths" checkbox `<div>` block (the `v-if="useCircleOfFifthViewer"` wrapper with the checkbox and circle component)

## 4. Handle template-switch reset

- [x] 4.1 In the template-change handler (`onChangeCustomNotes` or equivalent), reset `noteSelectionViewMode` to `"list"` when `useCircleOfFifthViewer` becomes false (replace existing `showCircleOfFifths = false` logic)

## 5. Verify synchronization

- [x] 5.1 Verify toggling notes in CircleOfFifths updates the shared `subsetEnabled` array and reflects in NoteSelectionList when switching back to list mode
- [x] 5.2 Verify toggling notes in NoteSelectionList reflects in CircleOfFifths when switching to circle mode
- [x] 5.3 Verify Select All / Select None / Rotate / Scale Options in list mode apply correctly and reflect when switching to circle mode
