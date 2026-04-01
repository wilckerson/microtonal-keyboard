## Context

The Fretboard2 panel currently presents note selection through two separate UI areas:

1. **"Subset enabled notes"** section — renders `NoteSelectionList` with a checkbox table, action buttons (Select All, Select None, Rotate), and scale options.
2. **"Show Circle of Fifths"** section — a standalone checkbox below the subset list that toggles `CircleOfFifths`, only visible when `useCircleOfFifthViewer: true`.

Both components operate on the same `subsetEnabled` boolean array and are already bidirectionally synchronized. The user's request is to unify them under one panel with a view-mode toggle.

Key constraint: Vue 2.6 Options API, component-local state, no global store.

## Goals / Non-Goals

**Goals:**
- Provide a view-mode selector inside the "Subset enabled notes" section that switches between "List" and "Circle of Fifths" views
- Keep shared action buttons (Select All, Select None, Rotate, scale options) accessible regardless of the active view mode
- Remove the standalone "Show Circle of Fifths" checkbox/div
- Only show the view-mode selector when `useCircleOfFifthViewer` is true; default to list-only when unavailable
- Preserve all existing synchronization behavior

**Non-Goals:**
- Changing CircleOfFifths rendering, styling, or layout
- Adding new selection/sync features
- Refactoring NoteSelectionList into smaller sub-components (extract action buttons) — keep the change minimal; buttons can stay inside NoteSelectionList and still work since the list is only hidden, not unmounted, when circle view is active. Actually, using `v-show` rather than `v-if` avoids losing component state.

## Decisions

### Decision 1: View-mode selector as inline radio buttons in Fretboard2

**Choice**: Add two radio buttons ("List" / "Circle of Fifths") directly in Fretboard2.vue inside the "Subset enabled notes" `<div>`, controlled by a new `noteSelectionViewMode` data property.

**Alternatives considered**:
- *Dropdown/select*: Overkill for two options, takes more clicks.
- *Segmented toggle component*: Cleaner but adds complexity for only two options.
- *Tabs inside NoteSelectionList*: Would couple the list component to the circle, violating separation of concerns.

**Rationale**: Radio buttons are the simplest native HTML approach, require no new components, and are immediately understandable. They live in Fretboard2 where the orchestration logic already resides.

### Decision 2: Use `v-show` instead of `v-if` for view toggling

**Choice**: Toggle visibility of `NoteSelectionList` and `CircleOfFifths` using `v-show` rather than `v-if`.

**Rationale**: `v-show` keeps both components mounted, preserving their internal state (scroll position, expanded scale options, etc.). Since both components are lightweight, the DOM cost of keeping them mounted is negligible. This also avoids re-triggering `mounted` hooks and re-populating selection state on each toggle.

### Decision 3: Keep action buttons inside NoteSelectionList

**Choice**: Do not extract Select All / Select None / Rotate / Scale Options out of `NoteSelectionList`.

**Alternatives considered**:
- *Extract buttons to Fretboard2*: Cleaner separation but requires moving template, methods, and event wiring — larger diff for marginal benefit.

**Rationale**: Since `v-show` keeps `NoteSelectionList` mounted even when the circle view is active, the buttons remain in the DOM and functional. However, they will be visually hidden when the circle is shown. To keep them accessible in circle mode, we'll show them separately above the view area. The simplest approach: duplicate the action buttons in Fretboard2 and show them only in circle mode, emitting the same operations (selectAll/selectNone/rotate) on the `subsetEnabled` array. Alternatively, a cleaner approach: move the action buttons to Fretboard2 once, and remove them from inside NoteSelectionList. Given the scope concern, we'll go with: **keep using `v-show` on the entire NoteSelectionList (buttons + table) and accept that buttons are only visible in list mode**. Circle-of-fifths users can switch back to list mode to use bulk actions. This is the minimal change.

### Decision 4: `noteSelectionViewMode` defaults and reset behavior

**Choice**: Default `noteSelectionViewMode` to `"list"`. When switching templates, if the new template does not have `useCircleOfFifthViewer: true`, reset the mode to `"list"`.

**Rationale**: Prevents the user from being stuck in a view mode that's no longer available after switching templates. Matches the existing pattern where `showCircleOfFifths` is reset to `false` on template switch.

## Risks / Trade-offs

- **Bulk actions hidden in circle mode** → Users must switch to list mode for Select All / Select None / Rotate / Scale Options. Mitigation: This is acceptable for v1; a future change could surface these actions in both modes.
- **Two components always mounted with `v-show`** → Minor extra DOM nodes. Mitigation: Both components are lightweight; no performance concern for 31 nodes.
- **Radio buttons may feel plain** → Mitigation: Can be styled later with CSS if desired; function over form for now.
