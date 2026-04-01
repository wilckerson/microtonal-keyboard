## Why

The Circle of Fifths and the flat note-selection list currently live in separate sections of the Fretboard2 panel. The circle appears below the subset list behind its own "Show Circle of Fifths" checkbox, forcing users to scroll and mentally map between two independent controls that operate on the same data. Consolidating them into a single "Subset enabled notes" area with a view-mode toggle will reduce clutter, make the relationship between the two visualizations obvious, and let users switch instantly between the linear list and the circular layout.

## What Changes

- Add a view-mode selector (e.g., radio buttons or segmented control) inside the "Subset enabled notes" panel with options **"List"** and **"Circle of Fifths"**.
- The "Circle of Fifths" option is only available when the active template has `useCircleOfFifthViewer: true`; otherwise the selector is hidden and the list view is shown by default.
- When "List" is selected, `NoteSelectionList` is visible and `CircleOfFifths` is hidden.
- When "Circle of Fifths" is selected, `CircleOfFifths` is visible and `NoteSelectionList` is hidden.
- Remove the standalone "Show Circle of Fifths" checkbox and its surrounding `<div>` that currently sits below the subset list.
- The "Select All", "Select None", "Rotate (modes)", and scale-options controls remain accessible in both view modes (they apply to the shared selection state).
- Bidirectional synchronization between the two views is preserved — toggling notes in either view updates the shared `subsetEnabled` array.

## Capabilities

### New Capabilities
- `note-selection-view-mode`: Introduces a view-mode toggle within the "Subset enabled notes" panel that lets the user switch between the flat list view and the circle-of-fifths view. Covers the selector UI, conditional availability based on template metadata, and show/hide logic for the two child components.

### Modified Capabilities
- `circle-of-fifths-selector`: The circle-of-fifths component moves from a standalone toggled section into the "Subset enabled notes" panel as an alternative view mode. Its visibility is now controlled by the view-mode selector instead of an independent checkbox. The synchronization requirements remain unchanged but the integration point shifts.

## Impact

- **Fretboard2.vue**: Restructure the "Subset enabled notes" section — remove the standalone circle-of-fifths checkbox/div, add the view-mode selector, conditionally render `NoteSelectionList` or `CircleOfFifths` based on selected mode.
- **NoteSelectionList.vue**: May need minor adjustments so the shared action buttons (Select All, Select None, Rotate, scale options) can be extracted or remain accessible when the list itself is hidden.
- **CircleOfFifths.vue**: No functional changes expected; only its mount point and visibility trigger change.
- **No dependency changes** — no new libraries or build changes required.
- **No breaking changes** — all existing selection/sync behavior is preserved.
