## ADDED Requirements

### Requirement: View-mode selector appears for eligible templates

The "Subset enabled notes" section in Fretboard2.vue SHALL display a view-mode selector with two options: **"List"** and **"Circle of Fifths"**. This selector SHALL only be visible when the active template has `useCircleOfFifthViewer: true`. When the selector is not visible, the list view SHALL be shown by default.

#### Scenario: Selector visible for eligible template
- **WHEN** the user selects a template with `useCircleOfFifthViewer: true`
- **THEN** a view-mode selector with options "List" and "Circle of Fifths" SHALL appear within the "Subset enabled notes" section

#### Scenario: Selector hidden for non-eligible template
- **WHEN** the user selects a template without `useCircleOfFifthViewer: true`
- **THEN** no view-mode selector SHALL be displayed
- **AND** the list view SHALL be shown

#### Scenario: Default selection is List
- **WHEN** the view-mode selector is first shown (after selecting an eligible template)
- **THEN** the "List" option SHALL be selected by default

### Requirement: View mode controls component visibility

Selecting a view mode SHALL show the corresponding component and hide the other. Both components SHALL remain mounted (using `v-show` semantics) to preserve internal state.

#### Scenario: List mode shows NoteSelectionList
- **WHEN** the user selects the "List" view mode
- **THEN** the `NoteSelectionList` component SHALL be visible
- **AND** the `CircleOfFifths` component SHALL be hidden

#### Scenario: Circle mode shows CircleOfFifths
- **WHEN** the user selects the "Circle of Fifths" view mode
- **THEN** the `CircleOfFifths` component SHALL be visible
- **AND** the `NoteSelectionList` component SHALL be hidden

#### Scenario: Switching modes preserves selection state
- **WHEN** the user selects notes in one view mode and then switches to the other
- **THEN** the note selection state SHALL be preserved across the switch

### Requirement: View mode resets when template becomes ineligible

When the user switches to a template that does not have `useCircleOfFifthViewer: true`, the view mode SHALL reset to "List".

#### Scenario: Switching to non-eligible template resets view mode
- **WHEN** the user is viewing the Circle of Fifths mode
- **AND** the user switches to a template without `useCircleOfFifthViewer: true`
- **THEN** the view mode SHALL reset to "List"
- **AND** the view-mode selector SHALL be hidden

#### Scenario: Switching between eligible templates preserves view mode
- **WHEN** the user is viewing the Circle of Fifths mode
- **AND** the user switches to another template that also has `useCircleOfFifthViewer: true`
- **THEN** the view mode SHALL remain as "Circle of Fifths"
