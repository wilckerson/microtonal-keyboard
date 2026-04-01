# FretsSectionExplorer

## Summary

`FretsSectionExplorer` is a C# console tool that finds optimal **string tunings** for a microtonal fretted instrument (e.g., guitar). Given an equal-temperament division (EDO), a fret span, and a set of target just-intonation chords, it brute-force iterates over all possible isomorphic string-step sizes and scores each one based on how well the notes within the fret section approximate the target chord intervals.

The entry point is `FretsSectionExplorer.MainComputation()`, called from `Program.cs`.

## Features

### Isomorphic String Step Search
- Iterates through all possible string step sizes (from 1 up to `stringStep * eqt`) within the given EDO.
- Each iteration evaluates how well a fret section around position 0 can approximate a list of target chords.

### Multi-Chord Averaging
- Evaluates multiple target chord voicings (all inversions of a 7-limit overtone tetrad by default) and averages the scores, favoring tunings that work well across chord types.

### Fret Section Grid Generation (`GetFretSectionNotes`)
- Builds a 2D grid of `[strings × frets]` ratios.
- Each string's open note is computed as `stringStep * stringIndex` steps in the given EDO.
- Frets span symmetrically around a center fret (from `-fretSpan+1` to `+fretSpan-1`).
- Uses `EqualTemperament.GetEqualTemperamentNote(noteIndex, eqt, baseValue)` to compute ratios.

### Scoring System (`GetIteration`)
- For each string, all fret ratios are octave-reduced via `Operations.Reduce(value, baseRefValue)` and then matched against the target chord ratios using `Operations.MatchTargetRatiosToScale(targetNotes, stringScale, toleranceInCents)`.
- Points (lower is better) are computed from three penalties:
  - **`pointsByUniqueTargetCounts`**: penalizes missing target notes — `100 - 100 * (uniqueMatched / totalTargets)`.
  - **`pointsByDistance`**: average Euclidean distance (string, fret) from the origin for each matched target note, grouped by target ratio.
  - **`pointsByRepetition`**: +10 penalty per string that matches 2+ target notes (preferring spread across strings).

### Colored Terminal Output (`DisplayArray2D`)
- Prints the fret grid with ANSI 24-bit color. Each ratio is colored based on its reduced position within the period using HSV-to-RGB conversion.
- Display is triggered automatically via `IterationResult.ToString()` — when the record carries a non-null `notes` grid, it calls `DisplayArray2D` before printing the closest-note details.

## Configuration Parameters (in `MainComputation`)

| Parameter | Default | Description |
|---|---|---|
| `baseRefValue` | 2 | The octave/period for octave-reduction (typically 2/1) |
| `baseValue` | 4 | The period of the EDO (e.g., 4 = two octaves) |
| `eqt` | 31 | Number of equal divisions of `baseValue` |
| `stringStep` | `1 / log_baseRef(baseValue)` | Scaling factor converting EDO steps to string steps |
| `fretSpan` | 5 | Half-width of fret window (total frets = `2*fretSpan - 1`) |
| `stringsNumber` | 6 | Number of strings |
| `toleranceInCents` | 30 | Max cents deviation to consider a match |
| `targetNotesList` | 7-limit overtone inversions 0–3 | List of chord voicings to evaluate |

## Key Dependencies (project files)

### `MicrotonalHelpers/EqualTemperament.cs`
- `GetEqualTemperamentNote(noteIndex, numberOfDivisions, period)` — returns `period^(noteIndex/numberOfDivisions)`.
- `GetEqualTemperamentSubsets(...)` — combinatorial subset enumeration (not used by FretsSectionExplorer).
- `ConvertSubsetToScale(...)` — converts index subset to ratio scale (not used by FretsSectionExplorer).

### `MicrotonalHelpers/Operations.cs`
- `Reduce(value, period)` — octave-reduces a ratio into the range `[1, period)`.
- `MatchTargetRatiosToScale(targetRatios, scale, toleranceInCents)` — finds the closest scale degree for each target ratio within tolerance. Returns `List<ClosestRationFromScaleResult>`.
- `GetClosestRatioFromScale(targetRatio, scale)` — finds the single closest match in a scale.
- `RatioToCents(ratio)` / `RatiosDiffInCents(r1, r2)` — cents conversion utilities.

### `MicrotonalHelpers/Chord.cs`
- Static arrays of just-intonation chord voicings (5-limit and 7-limit, overtone and undertone, all inversions).
- Used as `targetNotesList` entries.

### `MicrotonalHelpers/Diamond.cs`
- Tonality diamond ratio sets (5-limit through 9-limit). Not directly used by FretsSectionExplorer but available.

## Data Types

### `IterationResult` (record)
- `Points` (float): total penalty score (lower = better).
- `StepsByString` (float): the string step size for this iteration.
- `ClosestNotes` (IEnumerable<StringResult>): all matched notes across strings.
- `notes` (float[,]?, optional, default null): the fret-section grid for this iteration. When present, `ToString()` renders it via `DisplayArray2D`.
- `baseRefValue` (float, optional, default 2): the period used for octave-reduction when displaying the grid.

### `StringResult` (record)
- `StringIndex` (int): which string (0-based).
- `FretIndex` (int): fret position relative to center.
- `ClosestScaleRatio` (float): the matched scale ratio.
- `TargetRatio` (float): the target JI ratio that was matched.
- `Distance` (float, computed): `Vector2.Distance(Zero, (StringIndex, FretIndex))` — Euclidean distance from origin on the fretboard.

### `ClosestRationFromScaleResult` (record, in Operations.cs)
- `ScaleIndex` (int): index in the scale array.
- `DiffInCents` (float): how far off the match is.
- `TargetScaleRatio` (float): the target ratio.
- `ClosestScaleRatio` (float): the matched scale ratio.

## TODOs (from source)
- Consider non-isomorphic string steps (currently all strings use the same step size).
- Award more points when chord notes don't overlap on the same string.

## Technical Notes

- The scoring prefers configurations where each target chord tone lands on a **different string** and **close to the center fret position**.
- `baseValue = 4` with `eqt = 31` means 31 equal divisions of two octaves (equivalent to 31-EDO with doubled period), which produces the same pitch set as standard 31-EDO but doubles the number of candidate string steps.
- `stringStep = 1 / log₂(4) = 0.5` scales the iteration count so the loop covers all unique tunings within one period.
- The `fretSpan` of 5 produces 9 frets (`2*5 - 1`) centered on fret 0.
- Output top-3 results are sorted ascending by points (best first).
- The search is O(stringStep × eqt × |targetNotesList| × stringsNumber × fretSpan).
