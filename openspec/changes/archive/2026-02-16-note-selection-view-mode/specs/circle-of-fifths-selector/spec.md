## MODIFIED Requirements

### Requirement: Circle-of-fifths toggle appears only for eligible templates

The circle-of-fifths component visibility SHALL be controlled by the view-mode selector within the "Subset enabled notes" section, instead of a standalone "Show Circle of Fifths" checkbox. The standalone checkbox and its surrounding `<div>` SHALL be removed from `Fretboard2.vue`. The circle-of-fifths component SHALL be rendered inside the "Subset enabled notes" section and shown only when the view mode is set to "Circle of Fifths". The component SHALL only be available when the active template has `useCircleOfFifthViewer: true`.

#### Scenario: Circle shown via view-mode selector
- **WHEN** the user selects a template with `useCircleOfFifthViewer: true`
- **AND** the user selects the "Circle of Fifths" view mode
- **THEN** the `CircleOfFifths` component SHALL be visible within the "Subset enabled notes" section

#### Scenario: Circle hidden in list mode
- **WHEN** the user selects a template with `useCircleOfFifthViewer: true`
- **AND** the view mode is set to "List"
- **THEN** the `CircleOfFifths` component SHALL be hidden

#### Scenario: Standalone checkbox removed
- **WHEN** the Fretboard2 panel is rendered
- **THEN** no standalone "Show Circle of Fifths" checkbox SHALL exist outside the "Subset enabled notes" section

#### Scenario: Circle hidden when switching away from eligible template
- **WHEN** the user switches from a template with `useCircleOfFifthViewer: true` to one without
- **THEN** the `CircleOfFifths` component SHALL be hidden
- **AND** the view mode SHALL reset to "List"
