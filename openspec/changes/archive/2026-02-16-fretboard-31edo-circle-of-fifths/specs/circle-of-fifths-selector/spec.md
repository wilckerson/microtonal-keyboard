## ADDED Requirements

### Requirement: Template metadata declares circle-of-fifths eligibility

Note template objects in `note-templates.js` SHALL support three optional properties:
- `isEdo` (boolean) — declares the template as an EDO-based tuning.
- `edoIdx_Fifth` (integer) — the chromatic step index of the fifth interval within the EDO (e.g., 18 for 31edo).
- `useCircleOfFifthViewer` (boolean) — opt-in flag that enables the circle-of-fifths selector for this template.

The `CustomNotes` component SHALL forward these properties through its `@change` event alongside existing fields (`notes`, `noteNames`, `noteTexts`, `baseFreq`, `stringsTuningIdx`, `selectedTemplate`, `fullFrets`, `skipFretting`).

#### Scenario: 31edo template includes circle-of-fifths metadata
- **WHEN** the `"31edo - Guitar - Standard Tuning"` template is defined in `note-templates.js`
- **THEN** it SHALL have `isEdo: true`, `edoIdx_Fifth: 18`, and `useCircleOfFifthViewer: true`

#### Scenario: 31edo bass template includes circle-of-fifths metadata
- **WHEN** the `"31edo - Bass - Standard Tuning"` template is defined in `note-templates.js`
- **THEN** it SHALL have `isEdo: true`, `edoIdx_Fifth: 18`, and `useCircleOfFifthViewer: true`

#### Scenario: Non-31edo template omits circle-of-fifths metadata
- **WHEN** a non-31edo template (e.g., `"12edo - Guitar - Standard Tuning"`) is defined
- **THEN** it SHALL NOT have `useCircleOfFifthViewer: true`

#### Scenario: CustomNotes forwards metadata on template selection
- **WHEN** the user selects a template that has `useCircleOfFifthViewer: true`
- **THEN** the `CustomNotes` `@change` event SHALL include `isEdo`, `edoIdx_Fifth`, and `useCircleOfFifthViewer` values from the template

### Requirement: Circle-of-fifths toggle appears only for eligible templates

The middle control panel of `Fretboard2.vue` SHALL display a "Show Circle of Fifths" checkbox below the "Subset enabled notes" section. This checkbox SHALL only be visible when the active template has `useCircleOfFifthViewer: true`.

#### Scenario: Toggle visible for 31edo template
- **WHEN** the user selects a template with `useCircleOfFifthViewer: true`
- **THEN** a "Show Circle of Fifths" checkbox SHALL appear below the subset notes list

#### Scenario: Toggle hidden for non-eligible template
- **WHEN** the user selects a template without `useCircleOfFifthViewer: true`
- **THEN** no "Show Circle of Fifths" checkbox SHALL be displayed

#### Scenario: Toggle hidden when switching away from eligible template
- **WHEN** the user switches from a 31edo template to a 12edo template
- **THEN** the "Show Circle of Fifths" checkbox SHALL disappear and the circle component SHALL be hidden

### Requirement: Circle-of-fifths component renders notes in circular layout

The `CircleOfFifths.vue` component SHALL render all notes of the EDO arranged in a proper geometric circle. Each note SHALL be positioned radially at angle `(i / noteCount) * 360°` where `i` is the position in the circle-of-fifths sequence. Each position SHALL display a checkbox and the note name/text.

The circle-of-fifths order SHALL be computed as `(i * edoIdx_Fifth) % noteCount` for `i` in `0..noteCount-1`. For 31edo with `edoIdx_Fifth = 18`, this produces the sequence: 0, 18, 5, 23, 10, 28, 15, 2, 20, 7, 25, 12, 30, 17, 4, 22, 9, 27, 14, 1, 19, 6, 24, 11, 29, 16, 3, 21, 8, 26, 13.

#### Scenario: 31 notes rendered in circular positions
- **WHEN** the circle-of-fifths component is shown for a 31edo template
- **THEN** all 31 notes SHALL be displayed arranged in a circle, each with a checkbox and note label

#### Scenario: Notes ordered by fifths chain
- **WHEN** the circle is displayed for 31edo with `edoIdx_Fifth = 18`
- **THEN** the first position (top of circle) SHALL show chromatic index 0, the next position clockwise SHALL show chromatic index 18, the next SHALL show chromatic index 5, continuing by the generator sequence

#### Scenario: Checkboxes aligned radially
- **WHEN** the circle is rendered
- **THEN** each note's checkbox and label SHALL be positioned radially around the circle with labels oriented upright (readable, not rotated)

### Requirement: Circle checkboxes synchronize with subset selection

The checkboxes on the circle-of-fifths component SHALL be bidirectionally synchronized with the existing "Subset enabled notes" boolean array managed by `Fretboard2.vue`.

#### Scenario: Toggling a note on the circle updates the subset list
- **WHEN** the user checks a note checkbox on the circle-of-fifths
- **THEN** the corresponding note in the flat "Subset enabled notes" list SHALL also become checked
- **AND** the fretboard SHALL update to reflect the newly enabled note

#### Scenario: Toggling a note on the circle unchecks it
- **WHEN** the user unchecks a note checkbox on the circle-of-fifths
- **THEN** the corresponding note in the flat "Subset enabled notes" list SHALL also become unchecked
- **AND** the fretboard SHALL update to reflect the disabled note

#### Scenario: Toggling a note on the flat list updates the circle
- **WHEN** the user checks or unchecks a note in the flat "Subset enabled notes" list
- **THEN** the corresponding checkbox on the circle-of-fifths SHALL reflect the same state

#### Scenario: Select All/Select None affects the circle
- **WHEN** the user clicks "Select All" or "Select None" in the flat list
- **THEN** all checkboxes on the circle-of-fifths SHALL be updated to match

#### Scenario: Scale preset application reflects on the circle
- **WHEN** the user applies a scale preset (e.g., "Major") via the scale options
- **THEN** the circle-of-fifths checkboxes SHALL update to show only the notes included in that scale

### Requirement: Circle renders as a proper geometric circle

The circle-of-fifths container SHALL be styled as a visually recognizable circle using CSS. The layout SHALL use a visible circular border (`border-radius: 50%`) with note elements positioned around it using CSS transforms. The circle SHALL have adequate diameter (~300px or more) to accommodate all 31 note positions without overlapping.

#### Scenario: Visible circular shape
- **WHEN** the circle-of-fifths is displayed
- **THEN** a circular border or outline SHALL be visible, forming the visual ring on which notes are placed

#### Scenario: No note overlap at 31 positions
- **WHEN** all 31 notes are rendered on the circle
- **THEN** no two note labels or checkboxes SHALL visually overlap

### Requirement: NoteSelectionList accepts external selection state

`NoteSelectionList.vue` SHALL accept an optional `externalSelectedNotes` prop (boolean array). When provided, the component SHALL use this array as its selection state instead of internally managed state. Changes made within the component SHALL still emit the `@change` event.

#### Scenario: External state overrides internal state
- **WHEN** `externalSelectedNotes` prop is provided to `NoteSelectionList`
- **THEN** the component's checkboxes SHALL reflect the values from `externalSelectedNotes`

#### Scenario: No external state falls back to internal management
- **WHEN** `externalSelectedNotes` prop is not provided
- **THEN** `NoteSelectionList` SHALL manage its own `selectedNotes` array internally as before (no behavior change)

#### Scenario: Internal actions still emit change events
- **WHEN** the user interacts with `NoteSelectionList` while `externalSelectedNotes` is provided
- **THEN** the component SHALL emit `@change` with the updated selection for the parent to handle
